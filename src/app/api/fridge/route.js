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
        const systemPrompt = `You are an ingredient detection AI for Zaffaron cooking app.
Analyze the fridge/ingredients image.

Target Language: ${targetLang}

OUTPUT JSON Schema:
{
    "ingredients": ["localized_name1", "localized_name2"],
    "search_terms": ["english_name1", "english_name2"],
    "notes": "Optional observation in ${targetLang}"
}

Rules:
1. "ingredients": List items in ${targetLang}.
2. "search_terms": List corresponding items in ENGLISH.
   - IMPORTANT: Use GENERIC, SINGLE WORDS only.
   - Bad: "fresh organic tomato", "chicken breast"
   - Good: "tomato", "chicken", "egg", "onion"
   - This is for a database search, so be broad.
3. "notes": Write in ${targetLang}. Use a polite tone.
4. JSON ONLY. Do not wrap in markdown code blocks.
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

        if (ingredients.length === 0) {
            return NextResponse.json({
                ingredients: [],
                recipes: [],
                message: "No ingredients detected"
            });
        }

        // Step 2: Search for matching recipes
        let recipes = [];

        // Build a search query
        for (const term of searchTerms.slice(0, 5)) {
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
        console.error('Fridge API (Gemini) error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze image', details: error.message },
            { status: 500 }
        );
    }
}
