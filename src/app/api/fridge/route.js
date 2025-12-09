import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering (don't try to build statically)
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        // Lazy initialization - only runs when endpoint is called
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { image } = await request.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Step 1: Detect ingredients using Vision API
        const visionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an ingredient detection AI for Zaffaron cooking app.

Analyze the image of a fridge or ingredients and identify all visible food items.

OUTPUT JSON:
{
    "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
    "notes": "Optional observation about freshness or quantity"
}

Be specific: "eggs" not "food", "tomatoes" not "vegetables".
Only list clearly visible items.`
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "image_url",
                            image_url: {
                                url: image,
                                detail: "low"
                            }
                        },
                        {
                            type: "text",
                            text: "What ingredients do you see?"
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 300,
        });

        const detected = JSON.parse(visionResponse.choices[0].message.content);
        const ingredients = detected.ingredients || [];

        if (ingredients.length === 0) {
            return NextResponse.json({
                ingredients: [],
                recipes: [],
                message: "No ingredients detected"
            });
        }

        // Step 2: Search for matching recipes
        // Strategy: Use ILIKE to find recipes containing any of the detected ingredients
        let recipes = [];

        // Build a search query - look for recipes containing any detected ingredient
        for (const ingredient of ingredients.slice(0, 5)) { // Limit to top 5 ingredients
            const { data, error } = await supabase
                .from('recipes')
                .select('*, recipe_translations(*)')
                .or(`ingredients.cs.{${ingredient}},name.ilike.%${ingredient}%`)
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
