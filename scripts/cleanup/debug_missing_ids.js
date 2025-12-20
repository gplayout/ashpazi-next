require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMissing() {
    console.log("🔍 Checking IDs 1-20...");

    // 1. Check 'recipes' (Legacy Source)
    const { data: recipes, error: rErr } = await supabase
        .from('recipes')
        .select('id, title')
        .lt('id', 21)
        .order('id');

    if (rErr) console.error("Rec Error:", rErr);
    const rList = recipes || [];
    const recipeMap = new Map(rList.map(r => [r.id, r.title]));

    // 2. Check 'registry_recipes'
    const { data: registry } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .lt('legacy_recipe_id', 21);

    const registryMap = new Map(registry.map(r => [r.legacy_recipe_id, r.id]));

    // 3. Check 'content_translations'
    // Get UUIDs from registry to check translations
    const uuids = registry.map(r => r.id);
    const { data: translations } = await supabase
        .from('content_translations')
        .select('recipe_id, language_code')
        .in('recipe_id', uuids);

    const translationSet = new Set(translations.map(t => t.recipe_id));

    console.log("ID\t| In 'recipes'?\t| In 'registry'?\t| Has Translation?");
    console.log("---------------------------------------------------------");

    for (let i = 1; i <= 20; i++) {
        const inRecipes = recipeMap.has(i) ? "✅ Yes" : "❌ NO";
        const inRegistry = registryMap.has(i) ? "✅ Yes" : "❌ NO";
        const uuid = registryMap.get(i);
        const hasTrans = uuid && translationSet.has(uuid) ? "✅ Yes" : "❌ NO";

        console.log(`${i}\t| ${inRecipes}\t| ${inRegistry}\t\t| ${hasTrans}`);
    }
}

checkMissing();
