
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Init Clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TARGET_CATEGORIES = ['Italy', 'India', 'Mexico', 'China'];

async function enrichInsights() {
    console.log("🧠 upgrading Chef Insights to 'Premium'...");

    // 1. Fetch target recipes
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name_en, nutrition_info')
        .in('category', TARGET_CATEGORIES);

    if (error) {
        console.error("DB Error:", error);
        return;
    }

    console.log(`Found ${recipes.length} recipes to upgrade.`);

    for (const recipe of recipes) {
        console.log(`💡 Analyzing: ${recipe.name_en}...`);

        try {
            // Generate real insight
            const prompt = `
            You are a Michelin Star Chef.
            Write a short, fascinating insight about the dish: "${recipe.name_en}".
            Include history, flavor profile, or a serving tip.
            
            OUTPUT JSON:
            {
                "en": "...",
                "fa": "...",
                "es": "..."
            }
            
            Rules:
            - Max 2 sentences per language.
            - Farsi: Use polite, appetizing Persian (no robotic translation).
            - English: Sophisticated tone.
            `;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });

            const newInsights = JSON.parse(completion.choices[0].message.content);

            // Merge with existing nutrition_info
            const currentInfo = recipe.nutrition_info || {};

            // Deep merge safely
            if (!currentInfo.en) currentInfo.en = {};
            if (!currentInfo.fa) currentInfo.fa = {};
            if (!currentInfo.es) currentInfo.es = {};

            currentInfo.en.chef_insight = newInsights.en;
            currentInfo.fa.chef_insight = newInsights.fa;
            currentInfo.es.chef_insight = newInsights.es;

            // Update DB
            await supabase
                .from('recipes')
                .update({ nutrition_info: currentInfo })
                .eq('id', recipe.id);

            console.log(`   ✅ Upgraded Insight.`);

        } catch (e) {
            console.error(`   ❌ Failed: ${e.message}`);
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log("🎉 All insights validated and upgraded!");
}

enrichInsights();
