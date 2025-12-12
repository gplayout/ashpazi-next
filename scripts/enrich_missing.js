
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai'); // Change import
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize OpenAI (Unlimited quota compared to Gemini)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// Remove Gemini Init - const genAI...

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function enrichMissing() {
    console.log("🥘 Starting Enrichment for MISSING recipes (OpenAI GPT-4o-mini)...");

    // ... (DB Fetch logic remains same)
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, ingredients, nutrition_info')
        .is('nutrition_info', null);

    if (error) { console.error("DB Fetch Error:", error); return; }
    console.log(`Found ${recipes.length} recipes missing nutrition data.`);
    if (recipes.length === 0) return;

    for (const [i, recipe] of recipes.entries()) {
        console.log(`[${i + 1}/${recipes.length}] Processing: ${recipe.name}`);

        const newInfo = {};
        const languages = ['en', 'fa', 'es'];

        for (const lang of languages) {
            let targetLang = lang === 'fa' ? 'Persian' : (lang === 'es' ? 'Spanish' : 'English');

            const systemPrompt = `Analyze recipe and return valid JSON.
Schema: { "calories": number, "macros": { "protein": "10g", "carbs": "20g", "fat": "5g" }, "diet_labels": ["Tag"], "health_benefits": ["Benefit"], "chef_insight": "Insight in ${targetLang}" }
Rule: TRANSLATE DATA VALUES to ${targetLang}.`;

            const userPrompt = `Recipe: ${recipe.name}\nIngredients: ${JSON.stringify(recipe.ingredients)}`;

            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    response_format: { type: "json_object" }
                });

                newInfo[lang] = JSON.parse(completion.choices[0].message.content);

            } catch (err) {
                console.error(`   API Error (${lang}):`, err.message);
                if (err.message.includes('429')) await sleep(2000);
            }
        }


        if (Object.keys(newInfo).length > 0) {
            const { error: upErr } = await supabase
                .from('recipes')
                .update({ nutrition_info: newInfo })
                .eq('id', recipe.id);

            if (upErr) console.error("   DB Update Error:", upErr.message);
            else console.log("   ✅ Saved.");
        }

        await sleep(1000); // Rate limit buffer
    }
}

enrichMissing();
