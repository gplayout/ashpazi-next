
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFetch() {
    console.log("Testing fetchRecipes logic directly...");

    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*, recipe_translations(*)')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Supabase Error:", error);
    } else {
        if (recipes.length > 0) {
            console.log(`Recipe [${recipes[0].id}] loaded.`);
            console.log("Translations Field:", JSON.stringify(recipes[0].recipe_translations, null, 2));

            // Should be empty array if my hypothesis is correct
        }
    }
}

testFetch();
