
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPageQuery() {
    console.log("Testing Homepage Query...");

    // EXACT Query from src/app/page.js
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*, recipe_translations(*)')
        .not('image', 'is', null)
        .order('created_at', { ascending: false })
        .limit(24);

    if (error) {
        console.error("❌ CRITICAL: Homepage Query Failed!");
        console.error(error);
    } else {
        console.log(`✅ Query Successful. Retrieved ${recipes.length} recipes.`);
        if (recipes.length > 0) {
            console.log("Sample Recipe 0 Transaltions:", recipes[0].recipe_translations);
        }
    }
}

testPageQuery();
