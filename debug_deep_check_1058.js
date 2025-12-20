
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deepCheck() {
    const legacyId = 1058;
    console.log(`🔎 Trace for Legacy ID: ${legacyId}`);

    // 1. Check Registry Mapping
    const { data: registry, error: regError } = await supabase
        .from('registry_recipes')
        .select('id, legacy_recipe_id')
        .eq('legacy_recipe_id', legacyId)
        .single();

    if (regError || !registry) {
        console.error("❌ Registry Mapping NOT FOUND! Is migration fully run for this ID?");
        console.error(regError);
        return;
    }

    console.log(`✅ IDs Match: Legacy ${legacyId} => UUID ${registry.id}`);

    // 2. Check Translations
    const { data: translations, error: transError } = await supabase
        .from('content_translations')
        .select('id, language_code, title, publish_status')
        .eq('recipe_id', registry.id);

    if (transError) {
        console.error("❌ Translation Query Error:", transError);
        return;
    }

    console.log(`📊 Found ${translations.length} translations:`);
    translations.forEach(t => {
        console.log(`   - [${t.language_code}] Status: ${t.publish_status} | Title: "${t.title}"`);
    });

    const hasGerman = translations.find(t => t.language_code === 'de');
    if (hasGerman) {
        console.log("\n✅ GERMAN DATA EXISTS in DB.");
    } else {
        console.log("\n❌ GERMAN DATA MISSING in DB.");
    }
}

deepCheck();
