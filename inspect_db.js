
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
    // 1. Get 1 recipe
    const { data: recipes, error: rError } = await client
        .from('recipes')
        .select('*')
        .limit(1);

    console.log("Recipes Table Row 1:");
    console.log(JSON.stringify(recipes, null, 2));

    // 2. Get 1 translation
    const { data: translations, error: tError } = await client
        .from('content_translations')
        .select('*')
        .limit(1);

    console.log("\nTranslations Table Row 1:");
    console.log(JSON.stringify(translations, null, 2));

    // 3. Search for ANY string 'http' in image_url in recipes
    const { data: withHttp } = await client
        .from('recipes')
        .select('image_url')
        .ilike('image_url', '%http%')
        .limit(5);

    console.log("\nRecipes with 'http' in image_url:");
    console.log(JSON.stringify(withHttp, null, 2));

    // 4. Counts
    const { count: totalRecipes } = await client.from('recipes').select('*', { count: 'exact', head: true });
    console.log("\nTotal Recipes:", totalRecipes);
}

inspect();
