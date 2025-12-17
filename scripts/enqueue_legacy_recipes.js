
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function enqueue() {
    console.log("🔍 Scanning for legacy recipes to enqueue...");

    // 1. Get existing pipeline IDs
    const { data: existing, error: err1 } = await supabase
        .from('recipe_pipeline_state')
        .select('legacy_recipe_id');

    if (err1) {
        console.error("Failed to fetch state:", err1);
        return;
    }

    const existingIds = new Set(existing.map(r => r.legacy_recipe_id));

    // 2. Fetch candidates from recipes
    // Fetch 100 to ensure we find 30 gaps
    const { data: candidates, error: err2 } = await supabase
        .from('recipes')
        .select('id')
        .limit(100);

    if (err2) {
        console.error("Failed to fetch recipes:", err2);
        return;
    }

    // 3. Filter missing
    const toEnqueue = candidates
        .filter(r => !existingIds.has(r.id))
        .slice(0, 30) // Take top 30
        .map(r => ({
            legacy_recipe_id: r.id,
            status: 'new'
        }));

    if (toEnqueue.length === 0) {
        console.log("⚠️ No new legacy recipes found to enqueue (checks top 100).");
        return;
    }

    // 4. Insert (Upsert ignore duplicates)
    // Actually, pipeline state PK is legacy_recipe_id.
    const { error: insertErr } = await supabase
        .from('recipe_pipeline_state')
        .upsert(toEnqueue, { onConflict: 'legacy_recipe_id', ignoreDuplicates: true });

    if (insertErr) {
        console.error("Insert failed:", insertErr);
    } else {
        console.log(`✅ Successfully enqueued ${toEnqueue.length} recipes.`);
    }
}

enqueue();
