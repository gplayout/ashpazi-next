
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugCounts() {
    // 1. Total Recipes
    const { count: totalRecipes } = await client
        .from('recipes')
        .select('*', { count: 'exact', head: true });

    // 2. Total German (Count)
    const { count: totalGerman } = await client
        .from('content_translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'de')
        .eq('publish_status', 'published');

    console.log(`Explicit Count - Recipes: ${totalRecipes}`);
    console.log(`Explicit Count - German: ${totalGerman}`);

    // 3. Batch Script Query Simulation
    const { data: existingDe } = await client
        .from('content_translations')
        .select('registry_recipes(legacy_recipe_id)')
        .eq('language_code', 'de')
        .eq('publish_status', 'published')
        .range(0, 4999);

    console.log(`Batch Query Rows: ${existingDe.length}`);

    // Check coverage
    const doneIds = new Set(existingDe.map(t => t.registry_recipes?.legacy_recipe_id).filter(Boolean));
    console.log(`Unique Legacy IDs found in German Translations: ${doneIds.size}`);

    // Check All Recipes IDs
    const { data: allRecipes } = await client
        .from('recipes')
        .select('id')
        .range(0, 4999);

    console.log(`All Recipes IDs fetched: ${allRecipes.length}`);

    // Calculate Targets
    const targets = allRecipes.filter(r => !doneIds.has(r.id)).map(r => r.id);
    console.log(`Calculated Targets: ${targets.length}`);
}

debugCounts();
