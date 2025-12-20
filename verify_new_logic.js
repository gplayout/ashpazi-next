
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyNewLogic() {
    console.log("Verifying Second Hop Logic...");

    // 1. Fetch Recipes
    const { data: recipes } = await supabase
        .from('recipes')
        .select('id, name')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log(`Fetched ${recipes.length} recipes.`);
    const recipeIds = recipes.map(r => r.id);

    // 2. Fetch Registry
    const { data: registryMap } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .in('legacy_recipe_id', recipeIds);

    console.log(`Fetched ${registryMap.length} registry entries.`);

    // 3. Translations
    const uuids = registryMap.map(r => r.id);
    const { data: translations } = await supabase
        .from('content_translations')
        .select('recipe_id, language_code, title')
        .in('recipe_id', uuids);

    console.log(`Fetched ${translations.length} translations.`);

    // 4. Stitch Check
    recipes.forEach(r => {
        const uuidEntry = registryMap.find(reg => reg.legacy_recipe_id === r.id);
        if (uuidEntry) {
            const trs = translations.filter(t => t.recipe_id === uuidEntry.id);
            const langs = trs.map(t => t.language_code);
            console.log(`[${r.id}] ${r.name} -> Translations: [${langs.join(', ')}]`);
            if (langs.includes('de')) {
                console.log(`   ✅ German Title: ${trs.find(t => t.language_code === 'de').title}`);
            }
        } else {
            console.log(`[${r.id}] No UUID map.`);
        }
    });
}

verifyNewLogic();
