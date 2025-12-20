
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugRecipe746English() {
    console.log("=== DEBUG RECIPE 746 (ENGLISH) ===");

    // 1. Get UUID
    const { data: reg, error: regErr } = await supabase
        .from('registry_recipes')
        .select('id')
        .eq('legacy_recipe_id', 746)
        .single();

    if (regErr) { console.error("Registry Error:", regErr); return; }

    // 2. Fetch Translation
    const { data: tr, error: trErr } = await supabase
        .from('content_translations')
        .select('*')
        .eq('recipe_id', reg.id)
        .eq('language_code', 'en')
        .single();

    if (trErr) { console.error("Translation Error:", trErr); return; }

    if (!tr) {
        console.log("❌ NO English translation row found.");
        return;
    }

    console.log("✅ English Row Found!");
    console.log("Title:", tr.title);

    // CRITICAL CHECK: QA Metadata Structure
    console.log("\n--- QA METADATA ---");
    if (tr.qa_metadata) {
        console.log("Keys:", Object.keys(tr.qa_metadata));
        console.log("Marketing Desc:", tr.qa_metadata.marketing_description ? "EXISTS" : "MISSING");
        console.log("Chef Guide:", tr.qa_metadata.chef_guide ? "EXISTS" : "MISSING");
        console.log("Sample:", JSON.stringify(tr.qa_metadata).slice(0, 200));
    } else {
        console.log("❌ QA METADATA IS NULL/EMPTY");
    }
}

debugRecipe746English();
