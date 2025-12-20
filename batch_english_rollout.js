
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration
const API_URL = 'http://localhost:3000/api/pipeline/translate';
const SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';
const TARGET_LANG = 'en'; // UPGRADE english to Rich Content
const TARGET_COUNT = 1542;

async function batchRolloutEnglish() {
    console.log(`🚀 Starting Phase 7: English Content Upgrade (Target: ${TARGET_COUNT})...`);

    // 1. Get ALL Recipes (Pagination Fix)
    let allRecipes = [];
    let from = 0;
    const PAGE_SIZE = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('registry_recipes')
            .select('legacy_recipe_id')
            .order('legacy_recipe_id', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

        if (error) {
            console.error("FATAL: Could not fetch registry:", error);
            process.exit(1);
        }

        if (!data || data.length === 0) break;

        allRecipes = [...allRecipes, ...data];
        from += PAGE_SIZE;

        if (data.length < PAGE_SIZE) break;
    }

    console.log(`Found ${allRecipes.length} total recipes (Valid Pagination).`);

    // 2. Arm Pipeline (Status = manual_retry)
    // We want to force UPDATE even if 'translated_en' exists (because it's legacy)
    console.log("Arming Pipeline Status to 'manual_retry' (Force Upgrade)...");

    const CHUNK_SIZE = 100;
    for (let i = 0; i < allRecipes.length; i += CHUNK_SIZE) {
        const chunk = allRecipes.slice(i, i + CHUNK_SIZE);
        const updates = chunk.map(r => ({
            legacy_recipe_id: r.legacy_recipe_id,
            status: 'manual_retry', // Force retry
            last_processed_at: null
        }));

        const { error: upsertErr } = await supabase
            .from('recipe_pipeline_state')
            .upsert(updates, { onConflict: 'legacy_recipe_id' });

        if (upsertErr) console.error(`Chunk ${i / CHUNK_SIZE + 1} Error:`, upsertErr);
        else process.stdout.write(`Arming Chunk ${i / CHUNK_SIZE + 1} (${chunk.length} items)...\r`);
    }
    console.log("\n✅ All recipes armed for English Upgrade.");

    // 3. Trigger API Loop
    console.log(`\n⚡ Triggering Gemini 3 Processing Loop (lang=${TARGET_LANG})`);
    let keepGoing = true;
    let cycle = 0;
    let totalProcessed = 0;

    while (keepGoing && cycle < 600) { // Safety break
        try {
            // Call with batch_size=2 for stability (Timeout prevention)
            const res = await fetch(`${API_URL}?secret=${SECRET}&lang=${TARGET_LANG}&batch_size=2`);
            const json = await res.json();

            const count = json.summary?.processed_count || 0;
            totalProcessed += count;

            console.log(`Cycle ${cycle}: Processed ${count} recipes. (Total: ${totalProcessed})`);

            if (count === 0) {
                console.log("⚠️ Zero processed. Full Response:", JSON.stringify(json, null, 2));

                // Checking if done...
                const { count: remaining } = await supabase
                    .from('recipe_pipeline_state')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'manual_retry');

                if (remaining === 0) {
                    console.log("🎉 English Upgrade Complete. Total Processed: " + totalProcessed);
                    keepGoing = false;
                } else {
                    console.log(`Still ${remaining} pending. Retrying...`);
                    await new Promise(r => setTimeout(r, 5000));
                }
            }

            await new Promise(r => setTimeout(r, 2000)); // Polite delay
            cycle++;
        } catch (e) {
            console.error("API Loop Error:", e);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

batchRolloutEnglish();
