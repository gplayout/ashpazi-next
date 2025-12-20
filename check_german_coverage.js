
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCoverage() {
    // 1. Get total count of visible recipes (source of truth)
    // Assuming 'recipes' table is the source, or we count distinct recipe_ids in a master table.
    // Let's assume 'recipes' table exists or we use a known total from previous context (1544).
    // Better to query the DB for total recipes if possible.

    // Let's try to count unique recipe_ids from content_translations where language is 'en' (assuming base is EN)
    // or just count all unique recipe_ids.

    // Check total recipes count (base source)
    // If there is no 'recipes' table, we might need to rely on 'content_translations' count for 'en' or 'fa'.

    // Let's assume 'content_translations' with 'en' is the base.
    const { count: totalRecipes, error: totalError } = await client
        .from('content_translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'en'); // Assuming EN is the base language

    if (totalError) {
        console.error("Error getting total recipes:", totalError);
        return;
    }

    // 2. Get count of German translations
    const { count: germanCount, error: germanError } = await client
        .from('content_translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'de');

    if (germanError) {
        console.error("Error getting German count:", germanError);
        return;
    }

    const percentage = ((germanCount / totalRecipes) * 100).toFixed(2);

    console.log(`📊 German Content Coverage Audit:`);
    console.log(`-----------------------------------`);
    console.log(`Total Base Recipes (EN): ${totalRecipes}`);
    console.log(`Total German Translations: ${germanCount}`);
    console.log(`Coverage: ${percentage}%`);

    if (percentage > 95) {
        console.log(`✅ Target (>95%) Met!`);
    } else {
        console.log(`⚠️ Target NOT Met.`);
    }
}

checkCoverage();
