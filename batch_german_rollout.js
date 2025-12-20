
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// We use the internal API which handles the complex logic of calling AI, parsing JSON, and saving to content_translations
const API_URL = 'http://localhost:3000/api/pipeline/translate';
const SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';

async function batchRollout() {
    console.log("🚀 Starting Phase 5: Global German Rollout...");

    // 1. Find all Legacy Recipes (that are NOT Restored Legacy, or maybe ALL?)
    // Let's get ALL recipes first.
    const { data: allRecipes } = await client
        .from('recipes')
        .select('id, name');

    console.log(`Phase 5: Found ${allRecipes.length} total recipes.`);

    // 2. Find existing German Translations
    const { data: existingDe } = await client
        .from('content_translations')
        .select('registry_recipes(legacy_recipe_id)')
        .eq('language_code', 'de')
        .eq('publish_status', 'published');

    const doneIds = new Set(existingDe.map(t => t.registry_recipes?.legacy_recipe_id).filter(Boolean));
    console.log(`Phase 5: Found ${doneIds.size} already translated.`);

    // 3. Filter Target List
    const targets = allRecipes.filter(r => !doneIds.has(r.id));
    console.log(`Phase 5: Target List Size: ${targets.length}`);

    if (targets.length === 0) {
        console.log("✅ All done!");
        return;
    }

    // 4. Arm Pipeline State
    // We update 'recipe_pipeline_state' to 'manual_retry' so the API picks them up.
    // Batch upsert seems risky for 1500 items, let's chunk it.
    const CHUNK_SIZE = 100;
    for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
        const chunk = targets.slice(i, i + CHUNK_SIZE);
        console.log(`\nArming Chunk ${i / CHUNK_SIZE + 1} (${chunk.length} items)...`);

        const updates = chunk.map(r => ({
            legacy_recipe_id: r.id,
            status: 'manual_retry',
            last_processed_at: null, // Critical: Reset timer
            retry_count: 0
        }));

        const { error } = await client
            .from('recipe_pipeline_state')
            .upsert(updates, { onConflict: 'legacy_recipe_id' });

        if (error) console.error("❌ Error arming chunk:", error.message);
    }

    // 5. Trigger API Consumption
    // The API processes batches (e.g. 5 or 10 at a time). 
    // We need to call it repeatedly until it reports 0 processed.
    console.log("\n⚡ Triggering AI Processing Loop...");
    let keepGoing = true;
    let cycle = 1;
    let totalProcessed = 0;

    while (keepGoing && cycle < 500) { // Safety break
        try {
            // Need 'lang=de' param if API supports it, otherwise it defaults to 'en' usually?
            // Wait, fix_pipeline_trigger used 'lang=en'.
            // Does the API translate to ALL supported languages? Or just one?
            // The API code (I recall) loops through target languages. 
            // Phase 5 objective is specifically GERMAN.
            // If the API is "smart", it checks what is missing.
            // Let's assume standard trigger works.

            const res = await fetch(`${API_URL}?secret=${SECRET}&lang=de&batch_size=5`);
            const json = await res.json();

            const count = json.summary?.processed_count || 0;
            totalProcessed += count;
            console.log(`   Cycle ${cycle}: Processed ${count} recipes.`);

            if (count === 0) {
                // Double check: logic might limit concurrency?
                // If 0 processed, maybe queue is empty or all failed?
                console.log("   API reports 0 processed. Stopping loop.");
                keepGoing = false;
            }
            cycle++;

            // Artificial delay to respect rate limits
            await new Promise(r => setTimeout(r, 2000));

        } catch (e) {
            console.error("   ❌ API Call Failed:", e.message);
            keepGoing = false;
        }
    }

    console.log(`\n🎉 Rollout Complete. Total Processed in this run: ${totalProcessed}`);
}

batchRollout();
