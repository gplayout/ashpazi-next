require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration
const BATCH_TARGET = 2000; // Target ALL 1542 recipes
const API_URL = 'http://localhost:3000/api/pipeline/translate';
const SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
    console.log(`🚀 Starting FULL Migration Phase: All ${BATCH_TARGET} Recipes...`);
    console.log(`ℹ️  Strict Mode: No Skips, Full Regeneration with DB Overwrite.`);

    // STEP 1: SYNC & ENSURE INTEGRITY
    console.log(`\n📦 Step 1: Syncing Database Integrity...`);

    // 1a. Ensure Registry
    const { data: recipes } = await supabase.from('recipes').select('id').limit(5000);
    const { data: registry } = await supabase.from('registry_recipes').select('legacy_recipe_id').limit(5000);
    const existingIds = new Set(registry.map(r => r.legacy_recipe_id));
    const missingRegistry = recipes.filter(r => !existingIds.has(r.id));

    if (missingRegistry.length > 0) {
        console.log(`   Calls to create ${missingRegistry.length} missing registry entries...`);
        const { error } = await supabase.from('registry_recipes').upsert(
            missingRegistry.map(r => ({ legacy_recipe_id: r.id })),
            { onConflict: 'legacy_recipe_id', ignoreDuplicates: true }
        );
        if (error) console.error("   ❌ Registry Sync Error:", error.message);
        else console.log("   ✅ Registry Synced.");
    } else {
        console.log("   ✅ Registry Integrity OK.");
    }

    // 1b. Ensure Pipeline State
    const { data: pipeline } = await supabase.from('recipe_pipeline_state').select('legacy_recipe_id').limit(5000);
    const existingPipe = new Set(pipeline.map(r => r.legacy_recipe_id));
    const missingPipe = recipes.filter(r => !existingPipe.has(r.id));

    if (missingPipe.length > 0) {
        console.log(`   Calls to create ${missingPipe.length} missing pipeline states...`);
        const { error } = await supabase.from('recipe_pipeline_state').upsert(
            missingPipe.map(r => ({ legacy_recipe_id: r.id, status: 'manual_retry' })),
            { onConflict: 'legacy_recipe_id', ignoreDuplicates: true }
        );
        if (error) console.error("   ❌ Pipeline Sync Error:", error.message);
        else console.log("   ✅ Pipeline State Synced.");
    } else {
        console.log("   ✅ Pipeline State OK.");
    }

    // STEP 2: RESET ALL TO MANUAL_RETRY
    console.log(`\n🔄 Step 2: Resetting ALL recipes to 'manual_retry'...`);
    // We update ALL so that the API picks them up as priority
    const { error: resetErr } = await supabase
        .from('recipe_pipeline_state')
        .update({ status: 'manual_retry' })
        .gt('legacy_recipe_id', 0); // Updates all

    if (resetErr) {
        console.error("❌ Reset Failed:", resetErr);
        process.exit(1);
    }
    console.log("✅ All recipes marked for regeneration.");


    // STEP 3: EXECUTE BATCH
    console.log(`\n⚡ Step 3: Processing ALL recipes via API...`);

    let processed = 0;
    let failed = 0;
    let loops = 0;

    // We loop until we hit the target count is satisfied
    // The API processes in batches of ~5.
    while (processed < BATCH_TARGET) {
        loops++;
        // console.log(`   Loop ${loops}: calling API...`);

        try {
            const res = await fetch(`${API_URL}?secret=${SECRET}&lang=en`);
            const json = await res.json();

            if (!json.ok) {
                console.error("   API Error:", json.error);
                // Wait a bit and retry?
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }

            const { summary } = json;
            if (summary.success === 0 && summary.failed === 0) {
                console.log("   ⚠️ No more items to process (or all claimed).");
                break;
            }

            processed += summary.success;
            failed += summary.failed;

            // Log progress
            summary.details.forEach(d => {
                if (d.error) console.log(`   ❌ [${d.id}] Failed: ${d.error}`);
                else console.log(`   ✅ [${d.id}] Regerated: ${d.title.substring(0, 30)}...`);
            });

            console.log(`   👉 Progress: ${processed}/${BATCH_TARGET} (Failures: ${failed})`);

        } catch (e) {
            console.error("   Fetch connection error:", e.message);
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    console.log(`\n🎉 Phase 1 Complete.`);
    console.log(`Total Success: ${processed}`);
    console.log(`Total Failed: ${failed}`);
    console.log(`Next steps: Check http://localhost:3000/recipe/[ID] for a few samples.`);
}

runMigration();
