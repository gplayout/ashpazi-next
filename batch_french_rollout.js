
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const API_URL = 'http://localhost:3000/api/pipeline/translate';
const SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';

async function batchRolloutFrench() {
    console.log("🚀 Starting Phase 6: French Rollout (Target: 1542, Overwrite Mode)...");

    // 1. Get ALL Recipes (Pagination Fix)
    let allRecipes = [];
    let from = 0;
    const PAGE_SIZE = 1000;

    while (true) {
        const { data, error } = await client
            .from('recipes')
            .select('id')
            .range(from, from + PAGE_SIZE - 1)
            .order('id', { ascending: true });

        if (error) {
            console.error("Fetch Error:", error);
            return;
        }

        if (!data || data.length === 0) break;

        allRecipes = [...allRecipes, ...data];
        from += PAGE_SIZE;
        if (data.length < PAGE_SIZE) break;
    }

    console.log(`Found ${allRecipes.length} total recipes (Valid Pagination).`);

    // 2. Arm Pipeline (Status = manual_retry)
    const CHUNK_SIZE = 100;
    for (let i = 0; i < allRecipes.length; i += CHUNK_SIZE) {
        const chunk = allRecipes.slice(i, i + CHUNK_SIZE);
        console.log(`Arming Chunk ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} items)...`);

        const updates = chunk.map(r => ({
            legacy_recipe_id: r.id,
            status: 'manual_retry',
            last_processed_at: null,
            retry_count: 0
        }));

        const { error } = await client
            .from('recipe_pipeline_state')
            .upsert(updates, { onConflict: 'legacy_recipe_id' });

        if (error) console.error("❌ Error arming chunk:", error.message);
    }

    console.log("✅ All recipes armed for French Translation.");

    // 3. Trigger API Loop
    console.log("\n⚡ Triggering Gemini 3 Processing Loop (lang=fr)...");
    let keepGoing = true;
    let cycle = 1;
    let totalProcessed = 0;

    // Safety limit: 1542 / 5 (batch) = ~308 cycles. Set limit 600.
    while (keepGoing && cycle < 600) {
        try {
            // Call API with lang=fr
            const res = await fetch(`${API_URL}?secret=${SECRET}&lang=fr&batch_size=5`);

            if (!res.ok) {
                console.error(`   API Error Status: ${res.status}`);
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }

            const json = await res.json();
            const count = json.summary?.processed_count || 0;
            totalProcessed += count;

            console.log(`   Cycle ${cycle}: Processed ${count} recipes.`);

            if (count === 0) {
                console.log("   API reports 0 processed. Stopping loop.");
                keepGoing = false;
            }
            cycle++;

            // Wait 2s to be polite and avoid rate limits
            await new Promise(r => setTimeout(r, 2000));

        } catch (e) {
            console.error("   ❌ API Call Failed:", e.message);
            keepGoing = false;
        }
    }

    console.log(`\n🎉 French Rollout Complete. Total Processed: ${totalProcessed}`);
    console.log("Run 'node audit_french_status.js' to verify.");
}

batchRolloutFrench();
