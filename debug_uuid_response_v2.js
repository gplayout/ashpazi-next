
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkChain() {
    const slug = '616b36cb-d9dc-40cf-80fe-3bbaae257386';
    console.log(`Checking Slug: ${slug}`);

    // 1. Check Registry directly
    const { data: bridge, error: bErr } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id')
        .eq('id', slug)
        .maybeSingle();

    if (bErr || !bridge.data) {
        // use .select() returns array
        // actually supabase v2 returns {data, error}
        // let's adjust for array
        console.log("Registry Look result:", bridge);
        // We'll trust the output
    }

    // Easier: Just select
    const { data: bridges, error: err1 } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id')
        .eq('id', slug);

    if (err1) { console.error("Err1:", err1); return; }
    if (bridges.length === 0) { console.log("❌ No Registry Entry found for this UUID."); return; }

    const legacyId = bridges[0].legacy_recipe_id;
    console.log(`✅ Found Legacy ID: ${legacyId}`);

    // 2. Simulate checkForUpgrade (Fetch all translations for this legacy ID)
    const { data: upgrade, error: err2 } = await supabase
        .from('registry_recipes')
        .select(`
            content_translations(
                title, 
                language_code, 
                publish_status
            )
        `)
        .eq('legacy_recipe_id', legacyId)
        .single();

    if (err2 || !upgrade) {
        console.error("Err2 (Upgrade fetch):", err2);
        return;
    }

    const trans = upgrade.content_translations;
    console.log(`✅ Found ${trans.length} translations linked to Legacy ID ${legacyId}`);

    // 3. Print details of 'de'
    const de = trans.find(t => t.language_code === 'de');
    if (de) {
        console.log("🇩🇪 German Translation:");
        console.log("   Title:", de.title);
        console.log("   Status:", de.publish_status);
        if (de.publish_status !== 'published') console.log("   ⚠️ WARNING: Not 'published'?");
    } else {
        console.log("❌ NO 'de' translation found in the join.");
    }
}

checkChain();
