
const { createClient } = require('@supabase/supabase-js');
const RecipeEditorPro = require('../src/lib/ai/RecipeEditorPro');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Concurrency Limit (Speed vs Rate Limit)
const CONCURRENCY = 3;

async function runFullBatch() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    const agent = new RecipeEditorPro(apiKey);

    console.log(`🚀 Starting Full Batch Optimization for ALL Recipes...`);
    console.log(`⚡ Concurrency: ${CONCURRENCY}`);

    // 1. Fetch ALL IDs with Pagination (Handle > 1000 limit)
    let allRecipes = [];
    let from = 0;
    const PAGE_SIZE = 1000;

    console.log("📥 Fetching ALL recipe IDs...");

    while (true) {
        const { data, error } = await supabase
            .from('recipes')
            .select('id')
            .order('id', { ascending: true })
            .range(from, from + PAGE_SIZE - 1); // 0-999, 1000-1999

        if (error) {
            console.error("❌ Fetch error:", error);
            break;
        }

        if (!data || data.length === 0) break;

        allRecipes = [...allRecipes, ...data];
        from += PAGE_SIZE;

        console.log(`   Fetched ${data.length} IDs (Total: ${allRecipes.length})...`);
        if (data.length < PAGE_SIZE) break; // End of list
    }

    const total = allRecipes.length;
    console.log(`📋 Found TOTAL ${total} recipes.`);

    // Helper to process a single ID
    const processRecipe = async (id, index) => {
        try {
            // Fetch content & check if already done
            const { data: recipe } = await supabase
                .from('recipes')
                .select('id, name_en, ingredients_en, instructions_en, nutrition_info')
                .eq('id', id)
                .single();

            if (!recipe) return;

            // SKIP if already upgraded (Check for 'Origin & History' marker in description)
            const safeDesc = recipe.nutrition_info?.en?.description || "";
            if (safeDesc.includes("Origin & History") || safeDesc.includes("**Origin")) {
                // console.log(`⏭️ [${index}/${total}] Skipping ID ${id} (Already Done)`);
                return;
            }

            const rawText = `Name: ${recipe.name_en}\nIngredients: ${JSON.stringify(recipe.ingredients_en)}\nInstructions: ${JSON.stringify(recipe.instructions_en)}`;

            // Generate
            const result = await agent.process(rawText);

            if (result.status === "error") {
                console.error(`❌ [${index}/${total}] Failed ID ${id}:`, result.message);
                return;
            }

            // Save
            const output = result.output;
            const finalJson = {
                en: output.english,
                fa: output.persian,
                es: output.spanish,
                english: output.english, // Legacy format backup
                persian: output.persian
            };

            const updates = {
                nutrition_info: finalJson
            };

            const { error: updateError } = await supabase
                .from('recipes')
                .update(updates)
                .eq('id', id);

            if (updateError) {
                console.error(`❌ [${index}/${total}] DB Error ID ${id}:`, updateError.message);
            } else {
                console.log(`✅ [${index}/${total}] Updated ID ${id}: ${output.english.name}`);
            }

        } catch (err) {
            console.error(`🔥 [${index}/${total}] Crash ID ${id}:`, err.message);
        }
    };

    // 2. Process with Concurrency
    // We use a simple loop with a pool
    const queue = [...allRecipes];
    let activeWorkers = 0;
    let completed = 0;

    // Helper to run next
    const next = async () => {
        if (queue.length === 0) return;

        activeWorkers++;
        const item = queue.shift();
        const currentIdx = completed + 1;

        await processRecipe(item.id, currentIdx);

        completed++;
        activeWorkers--;

        // Trigger next if queue not empty
        if (queue.length > 0) {
            await next();
        }
    };

    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(next());
    }

    await Promise.all(workers);
    console.log(`\n🎉 Full Batch Process Complete!`);
}

runFullBatch();
