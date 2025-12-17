const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSlug(slug) {
    console.log(`\n--- Debugging Slug: "${slug}" ---`);
    const normalized = slug.replace(/-/g, ' ');
    console.log(`Normalized: "${normalized}"`);

    // 1. Check Published Translations
    console.log("\n1. Checking 'content_translations' (Published)...");
    const { data: trans, error: transErr } = await supabase
        .from('content_translations')
        .select(`title, registry_recipes!inner(legacy_recipe_id)`)
        .eq('publish_status', 'published')
        .or(`title.ilike.${normalized},title.eq.${normalized}`);

    if (trans && trans.length > 0) {
        console.log("✅ Found in content_translations:", trans);
    } else {
        console.log("❌ Not found in content_translations.");
        if (transErr) console.error("Error:", transErr);
    }

    // 2. Check Legacy Recipes
    console.log("\n2. Checking 'recipes' (Legacy tables)...");
    const { data: legacy, error: legacyErr } = await supabase
        .from('recipes')
        .select('id, name, name_en')
        .or(`name.ilike.${normalized},name.eq.${normalized},name_en.ilike.${normalized},name_en.eq.${normalized}`);

    if (legacy && legacy.length > 0) {
        console.log("✅ Found in recipes:", legacy);
    } else {
        console.log("❌ Not found in recipes.");
        if (legacyErr) console.error("Error:", legacyErr);
    }

    // 3. Search for anything SIMILAR
    console.log("\n3. Broad Search (Partial Match)...");
    const { data: broad } = await supabase
        .from('recipes')
        .select('id, name, name_en')
        .ilike('name_en', `%${normalized.split(' ')[0]}%`)
        .limit(3);

    console.log("   Detailed Suggestions:", broad);
}

debugSlug('ghormeh-sabzi');
