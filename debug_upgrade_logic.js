
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugUpgrade() {
    const legacyId = 1061; // Khoresht Piazagh
    console.log(`Checking Upgrade for Legacy ID: ${legacyId}`);

    // Mimic the query in data.js EXACTLY
    const { data: upgrade, error } = await client
        .from('registry_recipes')
        .select('content_translations(title, instructions, ingredients, qa_metadata, language_code, publish_status)')
        .eq('legacy_recipe_id', legacyId)
        .maybeSingle();

    if (error) {
        console.error("Query Error:", error);
        return;
    }

    if (!upgrade) {
        console.log("Upgrade object is NULL");
        return;
    }

    const translations = upgrade.content_translations;
    console.log(`Found ${translations?.length || 0} translations.`);

    if (translations) {
        translations.forEach(t => {
            console.log(`- [${t.language_code}] ${t.publish_status}: ${t.title}`);
        });
    }

    // Determine what verifyUpgrade would return
    let merged = { id: legacyId, nutrition_info: {} };
    if (translations && translations.length > 0) {
        translations.forEach(trans => {
            if (trans.publish_status !== 'published') return;
            merged.nutrition_info[trans.language_code || 'en'] = { name: trans.title };
        });
    }

    console.log("Resulting Nutrition Info Keys:", Object.keys(merged.nutrition_info));
}

debugUpgrade();
