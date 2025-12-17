
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 0. Load Env BEFORE importing client
console.log("--> Loading Environment...");
try {
    require('dotenv').config({ path: '.env.local' });
} catch (e) {
    console.error("Dotenv load failed", e);
}

// Dynamic imports
const { pipelineClient: supabase } = await import('../src/lib/pipeline-client.js');
const { IngestionAgent } = await import('../src/lib/pipeline/ingestion-agent.js');

async function runVerification() {
    console.log("=== Starting Standalone Verification ===");

    try {
        // 1. Setup
        console.log("--> Setting up Test Data...");

        // Valid
        const { data: r1, error: r1Err } = await supabase.from('recipes').insert({
            name: 'Test Setup Valid',
            ingredients: ['نمک', 'فلفل سیاه'],
            instructions: ['Mix well']
        }).select('id').single();
        if (r1Err) throw new Error(`R1 Setup Error: ${r1Err.message}`);

        const VALID_ID = r1.id;
        console.log(`    Created Valid Recipe ID: ${VALID_ID}`);

        // Invalid
        const { data: r2, error: r2Err } = await supabase.from('recipes').insert({
            name: 'Test Setup Invalid',
            ingredients: ['unobtanium_crystal'],
            instructions: ['Do nothing']
        }).select('id').single();
        if (r2Err) throw new Error(`R2 Setup Error: ${r2Err.message}`);
        const INVALID_ID = r2.id;
        console.log(`    Created Invalid Recipe ID: ${INVALID_ID}`);

        // State
        const { error: s1 } = await supabase.from('recipe_pipeline_state').upsert([
            { legacy_recipe_id: VALID_ID, status: 'new' },
            { legacy_recipe_id: INVALID_ID, status: 'new' }
        ]);
        if (s1) throw new Error(`State Setup Error: ${s1.message}`);

        console.log("    Setup Done.");

        // 2. Run Agent
        console.log("--> Running Ingestion Agent...");
        const { data: rows } = await supabase.from('recipe_pipeline_state')
            .select('*')
            .in('legacy_recipe_id', [VALID_ID, INVALID_ID]);

        for (const row of rows) {
            console.log(`    Processing Legacy ID: ${row.legacy_recipe_id}`);
            const res = await IngestionAgent.process(row);

            console.log(`    Result: Success=${res.success}`);
            if (!res.success) console.log(`    Error: ${JSON.stringify(res.error)}`);

            // Persist status
            if (res.success) {
                await supabase.from('recipe_pipeline_state').update({ status: 'normalized_ok', error_log: null }).eq('legacy_recipe_id', row.legacy_recipe_id);
            } else {
                await supabase.from('recipe_pipeline_state').update({ status: 'blocked_review', error_log: res.error }).eq('legacy_recipe_id', row.legacy_recipe_id);
            }
        }

        // 3. Final Check
        console.log("--> Verifying Final State...");
        const { data: finalRows } = await supabase.from('recipe_pipeline_state')
            .select('legacy_recipe_id, status')
            .in('legacy_recipe_id', [VALID_ID, INVALID_ID]);

        console.table(finalRows);

        // Assertions
        const validRow = finalRows.find(r => r.legacy_recipe_id === VALID_ID);
        const invalidRow = finalRows.find(r => r.legacy_recipe_id === INVALID_ID);

        if (validRow?.status === 'normalized_ok' && invalidRow?.status === 'blocked_review') {
            console.log("\n✅ VERIFICATION PASSED: Logic is correct.");
        } else {
            console.error("\n❌ VERIFICATION FAILED: Unexpected statuses.");
            // process.exit(1); 
        }

        // Cleanup
        console.log("--> Cleaning up...");
        const { data: regs } = await supabase.from('registry_recipes').select('id').in('legacy_recipe_id', [VALID_ID, INVALID_ID]);
        const regIds = regs?.map(r => r.id) || [];
        if (regIds.length) {
            await supabase.from('recipe_ingredients').delete().in('recipe_id', regIds);
            await supabase.from('recipe_groups').delete().in('recipe_id', regIds);
            await supabase.from('registry_recipes').delete().in('id', regIds);
        }
        await supabase.from('recipe_pipeline_state').delete().in('legacy_recipe_id', [VALID_ID, INVALID_ID]);
        await supabase.from('recipes').delete().in('id', [VALID_ID, INVALID_ID]);
        console.log("    Cleanup Done.");

        if (!(validRow?.status === 'normalized_ok' && invalidRow?.status === 'blocked_review')) {
            process.exit(1);
        }

    } catch (e) {
        console.error("CRITICAL FAILURE:", e);
        process.exit(1);
    }
}

runVerification();
