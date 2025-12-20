
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectTable() {
    console.log("🔍 Inspecting recipe_pipeline_state...");
    // Hack: Select a row to see keys
    const { data, error } = await supabase.from('recipe_pipeline_state').select('*').limit(1);

    if (error) {
        console.error("Error:", error.message);
    } else if (data && data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
    } else {
        console.log("Table empty or no access. Trying to insert dummy to get error...");
        const { error: insErr } = await supabase.from('recipe_pipeline_state').insert({ legacy_recipe_id: 999999 });
        if (insErr) console.log("Insert Error (might reveal schema):", insErr.message);
    }
}

inspectTable();
