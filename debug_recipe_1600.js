
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectRecipe1600() {
    const recipeId = 1600;

    // 1. Fetch base recipe row
    const { data: recipe, error: rError } = await client
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

    if (rError) {
        console.error("Error fetching recipe 1600:", rError);
        return;
    }

    console.log("🥘 Base Recipe (ID 1600):");
    console.log(`Name: ${recipe.name}`);
    console.log(`Image: ${recipe.image}`);
    console.log(`Ingredients Raw: ${JSON.stringify(recipe.ingredients).substring(0, 100)}...`);

    // 2. Fetch Translations (EN and DE)
    const { data: translations, error: tError } = await client
        .from('content_translations')
        .select('*')
        .eq('recipe_id', recipe.id); // Assuming content_translations links via integer ID? 
    // Actually usually it links via UUID if 'recipe_id' is uuid type.
    // Let's check both ID and UUID.

    if (translations && translations.length > 0) {
        console.log(`\nFound ${translations.length} translations:`);
        translations.forEach(t => {
            console.log(`- Lang: ${t.language_code}`);
            console.log(`  Title: ${t.title}`);
            console.log(`  Publish Status: ${t.publish_status}`);
            console.log(`  Ingredients Length: ${t.ingredients ? t.ingredients.length : 0}`);
            console.log(`  QA Metadata:`, t.qa_metadata);
        });
    } else {
        console.log("\n❌ No translations found linked to integer ID 1600.");

        // Try linking via UUID
        if (recipe.uuid) {
            const { data: transUUID } = await client
                .from('content_translations')
                .select('*')
                .eq('recipe_id', recipe.uuid);

            if (transUUID && transUUID.length > 0) {
                console.log(`\nFound ${transUUID.length} translations via UUID:`);
                transUUID.forEach(t => {
                    console.log(`- Lang: ${t.language_code}`);
                    console.log(`  Title: ${t.title}`);
                });
            } else {
                console.log("❌ No translations found via UUID either.");
            }
        }
    }
}

inspectRecipe1600();
