import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const { image, language = 'en' } = await request.json();

        // 1. Image Conversion
        if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 });
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];
        const imagePart = { inlineData: { data: base64Data, mimeType } };

        const langMap = { fa: 'Persian (Farsi)', es: 'Spanish', en: 'English' };
        const targetLang = langMap[language] || 'English';

        // 2. Vision API Detection
        const systemPrompt = `You are an expert Chef and Ingredient Detector for Zaffaron.
Analyze the image.

Target Language: ${targetLang}

OUTPUT JSON Schema:
{
    "detected_dish": "Name of the dish if it's a cooked meal (e.g. 'Macaroni Salad', 'Pizza') or null if raw ingredients",
    "ingredients": ["localized_name1", "localized_name2"],
    "search_terms": ["english_term1", "english_term2"],
    "notes": "Brief, polite observation in ${targetLang}"
}

Rules:
1. "detected_dish": If you see a finished meal, name it (English). If it's just a pile of ingredients/fridge, null.
2. "ingredients": List visible items in ${targetLang}.
3. "search_terms": 
   - IF "detected_dish" is found: Put the Dish Name as term #1. Then key ingredients.
   - IF ingredients only: List GENERIC, SINGLE English words (e.g. "tomato", "macaroni").
   - MAX 5 terms.
4. "notes": Write in ${targetLang}.
5. "ingredients": MUST be in ${targetLang}.
6. JSON ONLY. Do not wrap in markdown code blocks.
7. CRITICAL: Do NOT use English for value fields (except "search_terms" which MUST be English).
`;

        const result = await model.generateContent([systemPrompt, imagePart]);
        const responseText = result.response.text();
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const detected = JSON.parse(jsonStr);

        const ingredients = detected.ingredients || [];
        // Processing Search Terms (Split multi-word ingredients to ensure matches)
        const rawTerms = detected.search_terms || [];
        const processedTerms = new Set();

        rawTerms.forEach(term => {
            processedTerms.add(term.toLowerCase());
            // Split "elbow macaroni" -> add "macaroni"
            const words = term.split(' ');
            if (words.length > 1) {
                words.forEach(w => {
                    if (w.length > 3) processedTerms.add(w.toLowerCase()); // Skip "red", "of" etc.
                });
            }
        });
        const searchTerms = Array.from(processedTerms);

        if (ingredients.length === 0 && !detected.detected_dish) {
            return NextResponse.json({ ingredients: [], recipes: [], message: "No ingredients detected" });
        }

        let recipes = [];

        // STRATEGY A: Dish Name Search
        if (detected.detected_dish) {
            const { data: dishData } = await supabase
                .from('recipes')
                .select('*, recipe_translations!inner(*)')
                .eq('recipe_translations.language', 'en')
                .ilike('recipe_translations.title', `%${detected.detected_dish}%`)
                .limit(4);

            if (dishData) recipes.push(...dishData);
        }

        // STRATEGY B: Ingredient/Title Match (English Translations)
        if (recipes.length < 4) {
            for (const term of searchTerms.slice(0, 4)) {
                // Search Title OR Ingredients column (casting JSON/Array to text for simple matching)
                // Note: We use .or() with the foreign table filter syntax if possible, 
                // but supabase-js flat .or() works on the result set if not careful.
                // Correct deep filtering:

                const { data, error } = await supabase
                    .from('recipes')
                    .select('*, recipe_translations!inner(*)')
                    .eq('recipe_translations.language', 'en')
                    // Search if Title has term OR Ingredients text has term
                    // Syntax: column.operator.value, column.operator.value
                    .or(`title.ilike.%${term}%, ingredients.ilike.%${term}%`, { foreignTable: 'recipe_translations' })
                    .limit(2);

                if (data) recipes.push(...data);
            }
        }

        // Deduplicate
        const uniqueRecipes = Array.from(new Map(recipes.map(r => [r.id, r])).values()).slice(0, 6);

        return NextResponse.json({
            ingredients,
            recipes: uniqueRecipes,
            notes: detected.notes
        });

    } catch (error) {
        console.error('Fridge API error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
