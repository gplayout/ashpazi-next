
// Simulate fetchRecipes from actions.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchRecipesSimulated(page = 1, limit = 24) {
    console.log("Simulating fetchRecipes...");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 1. Fetch Recipes
    const { data: recipes } = await supabase
        .from('recipes')
        .select('*')
        .not('image', 'is', null)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (!recipes) return [];

    // 2. Registry
    const recipeIds = recipes.map(r => r.id);
    const { data: registryMap } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .in('legacy_recipe_id', recipeIds);

    const idToUuid = {};
    const uuids = [];
    registryMap.forEach(row => {
        idToUuid[row.legacy_recipe_id] = row.id;
        uuids.push(row.id);
    });

    // 3. Translations
    let translations = [];
    if (uuids.length > 0) {
        const { data: transData } = await supabase
            .from('content_translations')
            .select('recipe_id, language_code, title, instructions, qa_metadata') // rich content
            .in('recipe_id', uuids);
        if (transData) translations = transData;
    }

    // 4. Stitch
    const enriched = recipes.map(recipe => {
        const uuid = idToUuid[recipe.id];
        const matchingTranslations = translations.filter(t => t.recipe_id === uuid);
        return {
            ...recipe,
            recipe_translations: matchingTranslations || []
        };
    });

    return enriched;
}

async function verify() {
    const data = await fetchRecipesSimulated(1, 24);

    // Check Recipe 1599 (Torshi Liteh)
    const target = data.find(r => r.id === 1599);

    if (target) {
        console.log(`\n[Found Result] ID: ${target.id} | Name: ${target.name}`);
        console.log(`Translations Count: ${target.recipe_translations.length}`);

        target.recipe_translations.forEach(tr => {
            console.log(`   Lang: ${tr.language_code}`);
            console.log(`   Metadata Present? ${!!tr.qa_metadata}`);
            if (tr.qa_metadata) {
                console.log(`   Marketing: "${tr.qa_metadata.marketing_description}"`);
            }
        });
    } else {
        console.log("Recipe 1599 NOT FOUND in Page 1.");
    }
}

verify();
