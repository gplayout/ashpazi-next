
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forceReset() {
    console.log("🔨 Forcing 30 recipes to 'new' status...");

    // 1. Get IDs
    const { data: rows } = await supabase
        .from('recipe_pipeline_state')
        .select('legacy_recipe_id')
        .limit(30);

    if (!rows || rows.length === 0) {
        console.error("No rows found in pipeline state to reset.");
        return;
    }

    const ids = rows.map(r => r.legacy_recipe_id);
    console.log(`Resetting IDs: ${ids.length}`);

    // 2. Update
    const { error } = await supabase
        .from('recipe_pipeline_state')
        .update({
            status: 'new',
            error_log: null,
            last_processed_at: new Date().toISOString()
        })
        .in('legacy_recipe_id', ids);

    if (error) {
        console.error("Reset failed:", error.message);
    } else {
        console.log("✅ Reset complete. Ready for ingestion.");
    }
}

forceReset();
