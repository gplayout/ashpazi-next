
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugRecipe746() {
    console.log("=== DEBUG RECIPE 746 (French - V3 Deep Dive) ===");

    const { data: reg } = await supabase.from('registry_recipes').select('id').eq('legacy_recipe_id', 746).single();
    if (!reg) { console.log("No Registry Entry"); return; }

    const { data: tr } = await supabase
        .from('content_translations')
        .select('*')
        .eq('recipe_id', reg.id)
        .eq('language_code', 'fr')
        .single();

    if (!tr) { console.log("No FR Translation"); return; }

    console.log("Title (FR):", tr.title);
    console.log("Last Updated:", tr.last_updated); // Critical
    console.log("Pipeline Version:", tr.version); // Should be 2?

    console.log("\n--- INSTRUCTIONS SAMPLE ---");
    // Check if instructions are JSON or Text
    if (Array.isArray(tr.instructions)) {
        console.log("First Step:", JSON.stringify(tr.instructions[0]));
    } else {
        console.log("Instructions (Raw):", String(tr.instructions).substring(0, 100));
    }

    console.log("\n--- QA METADATA KEYS ---");
    console.log(Object.keys(tr.qa_metadata || {}));
}

debugRecipe746();
