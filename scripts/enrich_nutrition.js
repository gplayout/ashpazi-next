const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

// Configuration
const BATCH_SIZE = 10;
const DELAY_MS = 2000; // Gemini has stricter Rate Limits (15 RPM on free tier usually, but Flash is higher)
// We will respect limits by slowing down slightly.

// Init Clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const googleKey = process.env.GOOGLE_API_KEY;

if (!supabaseUrl || !supabaseKey || !googleKey) {
    console.error('❌ Missing Configurations. Check .env.local');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_API_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(googleKey);
const model = genAI.getGenerativeModel({
    model: "gemini-flash-lite-latest",
    generationConfig: { responseMimeType: "application/json" }
});

// Helper: Sleep
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function enrichRecipe(recipe) {
    console.log(`\n🍲 Processing: "${recipe.name}" (${recipe.id})`);

    // Skip if already has rich data for 3 langs
    // Actually we want to check deeply.
    // Simplifying logic: Just loop.

    try {
        const languages = ['en', 'fa', 'es'];
        let newInfo = recipe.nutrition_info || {};

        for (const lang of languages) {
            if (newInfo[lang]) continue;

            console.log(`   🔸 Generating [${lang}] (Gemini)...`);
            const langMap = { fa: 'Persian', en: 'English', es: 'Spanish' };
            const targetLang = langMap[lang];

            const prompt = `
You are Chef Zaffaron, an expert Nutritionist.
Analyze this recipe and return a JSON Object.

Recipe: ${recipe.name}
Ingredients: ${JSON.stringify(recipe.ingredients)}

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
2. TRANSLATE ALL VALUES to ${targetLang}.
3. 'macros' values should be like "24g".
`;

            // Gemini Call
            try {
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                const json = JSON.parse(responseText);
                newInfo[lang] = json;

                // Sleep specifically to avoid hitting Rate Limit per request if needed
                await sleep(1000);

            } catch (geminiError) {
                if (geminiError.message.includes('429')) {
                    console.warn('   ⚠️ Rate Limit Hit. Waiting 30s...');
                    await sleep(30000);
                    // Retry once? No, just skip to next for robustness
                } else {
                    console.error('   ⚠️ Gemini Error:', geminiError.message);
                }
            }
        }

        // Save to DB
        const { error } = await supabase
            .from('recipes')
            .update({ nutrition_info: newInfo })
            .eq('id', recipe.id);

        if (error) throw error;
        console.log('   💾 Saved to Database.');

    } catch (e) {
        console.error(`   ❌ Failed: ${e.message}`);
    }
}

async function main() {
    console.log('🚀 Starting Batch Nutrition Enrichment (POWERED BY GEMINI FLASH)...');

    let hasMore = true;
    let offset = 0;

    while (hasMore) {
        const { data: recipes, error } = await supabase
            .from('recipes')
            .select('id, name, ingredients, nutrition_info')
            .range(offset, offset + BATCH_SIZE - 1)
            .order('id');

        if (error) {
            console.error('Fatal DB Error:', error);
            break;
        }

        if (!recipes || recipes.length === 0) {
            console.log('🏁 No more recipes found. Done.');
            break;
        }

        console.log(`\n📂 Batch ${offset} - ${offset + recipes.length}`);

        for (const recipe of recipes) {
            await enrichRecipe(recipe);
            await sleep(DELAY_MS);
        }

        offset += BATCH_SIZE;
    }
}

main();
