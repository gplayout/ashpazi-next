import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
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

        // OpenAI: Accepts Data URL directly usually, but let's pass the URL if it's base64 data uri is fine in content
        // We will pass: { type: "image_url", image_url: { url: image } }

        // Init OpenAI
        const openai = new OpenAI({ apiKey });

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
3. "notes": Write in ${targetLang}. Use a polite tone.
4. JSON ONLY.
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Identify these ingredients:" },
                        { type: "image_url", image_url: { url: image } }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 300
        });

        const detected = JSON.parse(completion.choices[0].message.content);

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
        console.error('Fridge API error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze image', details: error.message },
            { status: 500 }
        );
    }
}
