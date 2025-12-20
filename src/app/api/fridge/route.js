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

        const langMap = { fa: 'Persian (Farsi)', es: 'Spanish', en: 'English' };
        const targetLang = langMap[language] || 'English';

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Convert base64 data URL to Part object for Gemini
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            },
        };

        // Step 1: Detect ingredients using Vision API
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
   - IF ingredients only: List GENERIC, SINGLE English words (e.g. "tomato", "chicken").
   - MAX 5 terms.
4. "notes": Write in ${targetLang}.
5. JSON ONLY.
`;

        const result = await model.generateContent([
            systemPrompt,
            imagePart
        ]);

        const responseText = result.response.text();

        // Clean markdown if present
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const detected = JSON.parse(jsonStr);

        // Display ingredients (Localized)
        const ingredients = detected.ingredients || [];
        // Search ingredients (English)
        const searchTerms = detected.search_terms || ingredients;

        if (ingredients.length === 0 && !detected.detected_dish) {
            return NextResponse.json({
                ingredients: [],
                recipes: [],
                message: "No ingredients detected"
            });
        }

        // Step 2: Search Logic (Smart Query)
        let recipes = [];

        // STRATEGY A: If Dish Name detected, search for it specifically first
        if (detected.detected_dish) {
            const { data: dishData } = await supabase
                .from('recipes')
                .select('*, recipe_translations!inner(*)')
                .eq('recipe_translations.language', 'en')
                .ilike('recipe_translations.title', `%${detected.detected_dish}%`)
                .limit(4);

            if (dishData && dishData.length > 0) {
                recipes.push(...dishData);
            }
        }

        // STRATEGY B: Ingredient Match (Fallback or Supplementary)
        if (recipes.length < 4) {
            for (const term of searchTerms.slice(0, 3)) { // Limit to top 3 terms
                // Search English Translation TITLE for the term
                const { data, error } = await supabase
                    .from('recipes')
                    .select('*, recipe_translations!inner(*)')
                    .eq('recipe_translations.language', 'en')
                    .ilike('recipe_translations.title', `%${term}%`)
                    .limit(2);  // Fetch 2 per term

                if (data && data.length > 0) {
                    recipes.push(...data);
                }
            }
        }

        // Deduplicate by ID
        const uniqueRecipes = Array.from(
            new Map(recipes.map(r => [r.id, r])).values()
        ).slice(0, 6); // Max 6 recipes (Strict cap)

        return NextResponse.json({
            ingredients,
            recipes: uniqueRecipes,
            notes: detected.notes
        });

    } catch (error) {
        console.error('Fridge API (Gemini) error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze image', details: error.message },
            { status: 500 }
        );
    }
}
