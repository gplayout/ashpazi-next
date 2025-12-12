import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const { title, ingredients, language = 'en' } = await request.json();

        // 1. Initialize Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        let supabase = null;

        if (supabaseUrl && supabaseKey) {
            supabase = createClient(supabaseUrl, supabaseKey);
        }

        // 2. Check Database for Cached Data
        let cachedFull = {};
        let cachedLangData = null;

        if (supabase) {
            try {
                const { data: dbData } = await supabase
                    .from('recipes')
                    .select('nutrition_info')
                    .eq('name', title)
                    .single();

                if (dbData?.nutrition_info) {
                    cachedFull = dbData.nutrition_info;
                    if (cachedFull[language]) {
                        cachedLangData = cachedFull[language];
                    }
                }
            } catch (e) {
                console.log("DB Read Error:", e.message);
            }
        }

        if (cachedLangData) {
            console.log(`Nutrition Cache Hit (DB) for ${title} [${language}]`);
            return NextResponse.json(cachedLangData);
        }

        // 3. Cache Miss - Generate via Gemini
        console.log(`Generating Nutrition via Gemini for ${title} [${language}]...`);

        const googleKey = process.env.GOOGLE_API_KEY;
        if (!googleKey) {
            return NextResponse.json({ error: 'Google API key missing' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(googleKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            generationConfig: { responseMimeType: "application/json" } // JSON Mode
        });

        const langMap = { fa: 'Persian', es: 'Spanish', en: 'English' };
        const targetLang = langMap[language] || 'English';

        const prompt = `
You are Chef Zaffaron, an expert Nutritionist.
Analyze this recipe and return a JSON Object.

Recipe: ${title}
Ingredients: ${JSON.stringify(ingredients)}

Target Language: ${targetLang}

JSON Schema:
{
    "calories": <number>,
    "macros": { "protein": "XXg", "carbs": "XXg", "fat": "XXg" },
    "diet_labels": ["Label1", "Label2"],
    "health_benefits": ["benefit 1", "benefit 2"],
    "chef_insight": "Insight in ${targetLang}"
}

Rules:
1. Accurate estimates.
2. TRANSLATE ALL VALUES (except keys) to ${targetLang}.
3. 'macros' values should be like "24g" (or equivalent in target language).
4. 'chef_insight': A brief customized tip about the health or history of this dish.
`;

        const result = await model.generateContent(prompt);
        const newData = JSON.parse(result.response.text());

        // 4. Save to Database
        if (supabase) {
            try {
                const updatedInfo = { ...cachedFull, [language]: newData };

                const { error: updateError } = await supabase
                    .from('recipes')
                    .update({ nutrition_info: updatedInfo })
                    .eq('name', title);

                if (updateError) {
                    console.error('Failed to cache nutrition:', updateError.message);
                } else {
                    console.log(`Nutrition Cached (Gemini) for ${title} [${language}]`);
                }
            } catch (e) {
                console.error("Save failed:", e);
            }
        }

        return NextResponse.json(newData);

    } catch (error) {
        console.error('Nutrition API Error:', error);
        return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
    }
}
