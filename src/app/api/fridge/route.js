import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const googleKey = process.env.GOOGLE_API_KEY;
        if (!googleKey) {
            return NextResponse.json({ error: 'Google API key not configured' }, { status: 500 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { image, language = 'en' } = await request.json();

        const langMap = { fa: 'Persian (Farsi)', es: 'Spanish', en: 'English' };
        const targetLang = langMap[language] || 'English';

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Convert Data URL to standard Base64 for Gemini
        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }
        const mimeType = matches[1];
        const base64Data = matches[2];

        // Init Gemini
        const genAI = new GoogleGenerativeAI(googleKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            generationConfig: { responseMimeType: "application/json" }
        });

        // Step 1: Detect ingredients using Vision API
        const prompt = `
You are an ingredient detection AI for Zaffaron cooking app.
Analyze the image of a fridge or ingredients and identify all visible food items.

Target Language: ${targetLang}

OUTPUT JSON Schema:
{
    "ingredients": ["localized_name1", "localized_name2"],
    "search_terms": ["english_name1", "english_name2"],
    "notes": "Optional observation about freshness or quantity in ${targetLang}"
}

Rules:
1. "ingredients": List items in ${targetLang}.
2. "search_terms": List corresponding items in ENGLISH (for database search).
3. "notes": Write in ${targetLang}. Use a polite, helpful tone.
   - If Farsi: Use "Polite Conversational" (Mohavere Mohtaramane). e.g. "Be nazar miad..." instead of "Be nazar miayad".
4. Be specific: "eggs", "tomatoes" -> "tokhme morgh", "goje farangi". Only clearly visible items.
`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: mimeType } }
        ]);

        const detected = JSON.parse(result.response.text());

        // Display ingredients (Localized)
        const ingredients = detected.ingredients || [];
        // Search ingredients (English)
        const searchTerms = detected.search_terms || ingredients;

        if (ingredients.length === 0) {
            return NextResponse.json({
                ingredients: [],
                recipes: [],
                message: "No ingredients detected"
            });
        }

        // Step 2: Search for matching recipes
        let recipes = [];

        // Build a search query - look for recipes containing any detected ingredient
        for (const term of searchTerms.slice(0, 5)) { // Limit to top 5 ingredients
            const { data, error } = await supabase
                .from('recipes')
                .select('*, recipe_translations(*)')
                .or(`ingredients.cs.{${term}},name.ilike.%${term}%`)
                .limit(2);

            if (data && data.length > 0) {
                recipes.push(...data);
            }
        }

        // Deduplicate by ID
        const uniqueRecipes = Array.from(
            new Map(recipes.map(r => [r.id, r])).values()
        ).slice(0, 6); // Max 6 recipes

        return NextResponse.json({
            ingredients,
            recipes: uniqueRecipes,
            notes: detected.notes
        });

    } catch (error) {
        console.error('Fridge API error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze image', details: error.message },
            { status: 500 }
        );
    }
}
