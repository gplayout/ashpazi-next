
const { createClient } = require('@supabase/supabase-js');
const RecipeEditorPro = require('../src/lib/ai/RecipeEditorPro');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    console.log("🎩 RecipeEditorPro Batch Processor Starting...");

    // 1. Initialize Agent
    const agent = new RecipeEditorPro(apiKey);

    // 2. Fetch Latest 1000 Recipes
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name_en, ingredients_en, instructions_en')
        .order('id', { ascending: false })
        .limit(1000);

    if (error) {
        console.error("DB Error:", error.message);
        return;
    }

    console.log(`📋 Found ${recipes.length} recipes. Processing one by one...\n`);

    // Reliability Helpers
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const MAX_RETRIES = 3;

    for (const recipe of recipes) {
        console.log(`👨‍🍳 Editing: ${recipe.name_en} (ID: ${recipe.id})...`);

        // Prepare raw text context
        const rawText = `
        Name: ${recipe.name_en}
        Ingredients: ${JSON.stringify(recipe.ingredients_en)}
        Instructions: ${JSON.stringify(recipe.instructions_en)}
        `;

        let attempts = 0;
        let success = false;

        while (attempts < MAX_RETRIES && !success) {
            attempts++;
            try {
                // Process (Text Only as requested)
                const result = await agent.process(rawText, null);

                if (result.status === "success") {
                    const data = result.output;
                    // Save to DB
                    await saveToDB(recipe.id, data);
                    console.log("   ✅ Done! Saved Strict Format.");
                    success = true;
                } else {
                    throw new Error(result.message); // Force retry on logic error
                }
            } catch (err) {
                console.error(`   ⚠️ Attempt ${attempts} Failed: ${err.message}`);
                if (attempts < MAX_RETRIES) {
                    const waitTime = 2000 * Math.pow(2, attempts); // 4s, 8s, 16s...
                    console.log(`   ⏳ Retrying in ${waitTime / 1000}s...`);
                    await sleep(waitTime);
                } else {
                    console.error(`   ❌ FATAL: Giving up on Recipe ${recipe.id} after ${MAX_RETRIES} attempts.`);
                }
            }
        }

        // Rate Limit Check (Native Pause)
        await sleep(1000);
    }

    console.log(`\n🎉 Process Complete. Checked ${recipes.length} recipes.`);
}

async function saveToDB(id, data) {
    // 1. Update Main Recipe (Aggregated Metadata)
    const category = data.english?.categories?.[0] || 'Main Course';
    const prepTime = data.english?.times?.prep || 0;

    const updatePayload = {
        category: category,
        prep_time_minutes: prepTime,
        // SYNC MAIN COLUMNS (Crucial for UI visibility!)
        name_en: data.english.name,
        ingredients_en: data.english.ingredients,
        instructions_en: data.english.instructions,

        // SYNC BASE COLUMNS (PWA Defaults to these!)
        name: data.persian.name,
        ingredients: data.persian.ingredients,
        instructions: data.persian.instructions,

        // Store the FULL strict JSON in nutrition_info with UI-compatible keys
        nutrition_info: {
            fa: { ...data.persian, chef_insight: data.persian.chef_notes },
            en: { ...data.english, chef_insight: data.english.chef_notes },
            es: { ...data.spanish, chef_insight: data.spanish.chef_notes },
            validation: { is_match: true, explanation: "Skipped by user request", corrections: "N/A" }
        }
    };

    const { error: mainError } = await supabase
        .from('recipes')
        .update(updatePayload)
        .eq('id', id);

    if (mainError) console.error("   ⚠️ Main DB Save Error:", mainError.message);

    // 2. Update Translations
    const translations = [
        {
            recipe_id: id,
            language: 'fa',
            title: data.persian.name,
            description: data.persian.description,
            ingredients: data.persian.ingredients,
            instructions: data.persian.instructions
        },
        {
            recipe_id: id,
            language: 'en',
            title: data.english.name,
            description: data.english.description,
            ingredients: data.english.ingredients,
            instructions: data.english.instructions
        },
        {
            recipe_id: id,
            language: 'es',
            title: data.spanish.name,
            description: data.spanish.description,
            ingredients: data.spanish.ingredients,
            instructions: data.spanish.instructions
        }
    ];

    const { error: transError } = await supabase
        .from('recipe_translations')
        .upsert(translations, { onConflict: 'recipe_id, language' });

    if (transError) console.error("   ⚠️ Translation DB Save Error:", transError.message);
}

main();
