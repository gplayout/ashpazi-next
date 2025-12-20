
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const API_URL = 'http://localhost:3000/api/pipeline/translate';
const SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';
const CONCURRENCY = 5;

async function batchTurbo() {
    console.log("🚀 Starting Phase 5: TURBO German Rollout (Concurrent Mode)...");

    // 1. Get targets (Existing logic)
    // Helper for pagination
    async function fetchAll(table, select, filterFn) {
        let all = [];
        let from = 0;
        const size = 1000;
        while (true) {
            let query = client.from(table).select(select).range(from, from + size - 1);
            if (filterFn) query = filterFn(query);

            const { data, error } = await query;
            if (error) throw error;
            if (!data || data.length === 0) break;

            all = all.concat(data);
            if (data.length < size) break;
            from += size;
        }
        return all;
    }

    // 1. Get targets (Pagination logic)
    const allRecipes = await fetchAll('recipes', 'id');
    const existingDe = await fetchAll('content_translations', 'registry_recipes(legacy_recipe_id)', (q) =>
        q.eq('language_code', 'de').eq('publish_status', 'published')
    );

    console.log(`Debug: All Recipes ${allRecipes.length}, Translated ${existingDe.length}`);

    const doneIds = new Set(existingDe.map(t => t.registry_recipes?.legacy_recipe_id).filter(Boolean));
    const targets = allRecipes.filter(r => !doneIds.has(r.id)).map(r => r.id);

    console.log(`Targets: ${targets.length}`);
    if (targets.length === 0) return;

    // 2. Arm Pipeline (Optimized: One giant upsert if possible, or large chunks)
    console.log("Arming pipeline...");
    // Only arm first 200 for now to test speed, then loop? No, let's just do it.
    // Actually, we don't strictly NEED to arm 'manual_retry' if we pass ID directly to API?
    // But the API might check if it's in a valid state. 
    // And standard API logic checks `manual_retry` to bypass "already exists" check (line 105).
    // So YES, we MUST arm them to 'manual_retry' to force regeneration/generation.

    const CHUNK_SIZE = 100;
    for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
        const chunk = targets.slice(i, i + CHUNK_SIZE);
        await client.from('recipe_pipeline_state').upsert(
            chunk.map(id => ({ legacy_recipe_id: id, status: 'manual_retry', last_processed_at: null })),
            { onConflict: 'legacy_recipe_id' }
        );
        process.stdout.write('.');
    }
    console.log("\nPipeline Armed.");

    // 3. Worker Pool
    let currentIndex = 0;
    let successCount = 0;
    let failCount = 0;

    const worker = async (workerId) => {
        while (currentIndex < targets.length) {
            const myIndex = currentIndex++; // Atomic claim
            const id = targets[myIndex];

            try {
                // console.log(`[W${workerId}] Processing ${id}...`);
                const res = await fetch(`${API_URL}?secret=${SECRET}&lang=de&id=${id}`);
                const json = await res.json();

                if (json.ok && json.summary?.success > 0) {
                    successCount++;
                    // console.log(`[W${workerId}] ✅ ${id} Done.`);
                } else {
                    failCount++;
                    console.error(`[W${workerId}] ❌ ${id} Failed:`, JSON.stringify(json));
                }
            } catch (e) {
                failCount++;
                console.error(`[W${workerId}] ❌ ${id} Network Error:`, e.message);
            }

            if ((successCount + failCount) % 10 === 0) {
                process.stdout.write(` Progress: ${successCount + failCount}/${targets.length} (Sw:${workerId}) \r`);
            }
        }
    };

    console.log(`Firing ${CONCURRENCY} workers...`);
    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(worker(i + 1));
    }

    await Promise.all(workers);
    console.log(`\n🎉 Job Complete. Success: ${successCount}, Failed: ${failCount}`);
}

batchTurbo();
