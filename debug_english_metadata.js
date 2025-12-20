
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugEnglishMetadata() {
    console.log("Debugging English Metadata for Restored Recipes...");

    // Fetch Restored Recipes
    const { data: recipes } = await supabase
        .from('recipes')
        .select('id')
        .gte('id', 1584)
        .lte('id', 1605);

    const recipeIds = recipes.map(r => r.id);

    // Registry
    const { data: registryMap } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .in('legacy_recipe_id', recipeIds);

    const uuids = registryMap.map(r => r.id);

    // English Translations
    const { data: translations } = await supabase
        .from('content_translations')
        .select('recipe_id, language_code, title, qa_metadata')
        .in('recipe_id', uuids)
        .eq('language_code', 'en'); // Target English

    translations.forEach(t => {
        const meta = t.qa_metadata || {};
        const marketing = meta.marketing_description;
        console.log(`[EN] ${t.title.substring(0, 20)}... -> Marketing: "${marketing || 'MISSING'}"`);
    });
}

debugEnglishMetadata();
