
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const API_URL = 'http://localhost:3000/api/pipeline/translate';
const SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';

async function fixAndTrigger() {
    console.log("🚀 Fixing Pipeline State & Triggering AI...");

    // 1. Get the IDs from recipes table (integers)
    const { data: recipes } = await supabase
        .from('recipes')
        .select('id, name')
        .eq('category', 'Restored Legacy'); // This gives us 1584, etc.

    if (!recipes || recipes.length === 0) {
        console.log("❌ No restored legacy recipes found.");
        return;
    }

    // 2. Arm Pipeline
    for (const r of recipes) {
        console.log(`\nArming ID ${r.id} (${r.name})...`);
        const { error } = await supabase.from('recipe_pipeline_state').upsert({
            legacy_recipe_id: r.id,
            status: 'manual_retry',
            last_processed_at: null, // Reset time so API picks it up
            retry_count: 0
        }, { onConflict: 'legacy_recipe_id' });

        if (error) console.error("   ❌ Error:", error.message);
        else console.log("   ✅ Pipeline Armed.");
    }

    // 3. Trigger API (Batch of 5 at a time)
    // We have 17 items. We need ~4 calls.
    console.log("\n⚡ Triggering Batch Processing...");

    for (let i = 0; i < 5; i++) {
        console.log(`   Calling API Batch ${i + 1}...`);
        try {
            const res = await fetch(`${API_URL}?secret=${SECRET}&lang=en`);
            const json = await res.json();
            console.log(`   Response: Processed ${json.summary?.processed_count || 0} items.`);
            // if (json.summary?.processed_count === 0) break; // Don't break early, retry logic might skip some
        } catch (e) {
            console.error("   ❌ API Call Failed:", e.message);
        }
    }

    console.log("\n✅ Done. Check verify_uuid.js in a moment.");
}

fixAndTrigger();
