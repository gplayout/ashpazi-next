
const { createClient } = require('@supabase/supabase-js');
const RecipeEditorPro = require('../src/lib/ai/RecipeEditorPro');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runBatch5() {
    const IDS_TO_PROCESS = [251, 252, 253, 254, 255];
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    const agent = new RecipeEditorPro(apiKey);

    console.log(`🚀 Starting Batch Test for IDs: ${IDS_TO_PROCESS.join(', ')}`);

    for (const id of IDS_TO_PROCESS) {
        console.log(`\n-----------------------------------`);
        console.log(`Processing Recipe ID: ${id}...`);

        // 1. Fetch
        const { data: recipe, error } = await supabase
            .from('recipes')
            .select('id, name_en, ingredients_en, instructions_en')
            .eq('id', id)
            .single();

        if (error || !recipe) {
            console.error(`❌ Failed to fetch ID ${id}:`, error);
            continue;
        }

        const rawText = `Name: ${recipe.name_en}\nIngredients: ${JSON.stringify(recipe.ingredients_en)}\nInstructions: ${JSON.stringify(recipe.instructions_en)}`;

        // 2. Generate
        const result = await agent.process(rawText);

        if (result.status === "error") {
            console.error(`❌ AI Failed for ID ${id}:`, result.message);
            continue;
        }

        // 3. Save & Sync
        const output = result.output;

        // Prepare Data for Update
        // Key Mapping: ensure we store valid JSON for en/fa/es
        const finalJson = {
            en: output.english,
            fa: output.persian,
            es: output.spanish,
            english: output.english, // Legacy compat
            persian: output.persian  // Legacy compat
        };

        const updates = {
            nutrition_info: finalJson,
            // FORCE SYNC SKIP: Columns description/slug do not exist in Schema.
            // We rely on nutrition_info JSON for the UI.
            // description: output.english.description, 
            // name_en: output.english.name,
            // slug: output.english.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        };

        const { error: updateError } = await supabase
            .from('recipes')
            .update(updates)
            .eq('id', id);

        if (updateError) {
            console.error(`❌ DB Update Failed for ID ${id}:`, updateError);
        } else {
            console.log(`✅ Success! Updated ID ${id} (${output.english.name})`);
            console.log(`   - History: "${output.english.description.slice(0, 50)}..."`);
            console.log(`   - Chef Notes: ${!!output.english.chef_notes}`);
        }
    }

    console.log(`\n🎉 Batch of 5 COMPLETE.`);
}

runBatch5();
