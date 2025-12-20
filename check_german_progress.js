
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProgress() {
    // 1. Total Recipes to Translate
    const { count: totalRecipes } = await client
        .from('recipes')
        .select('*', { count: 'exact', head: true });

    // 2. Total Already Translated
    const { count: totalGerman } = await client
        .from('content_translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'de')
        .eq('publish_status', 'published');

    const remaining = totalRecipes - totalGerman;
    const percent = Math.round((totalGerman / totalRecipes) * 100);

    console.log("📊 Status Update:");
    console.log(`- Total Goal: ${totalRecipes}`);
    console.log(`- Completed:  ${totalGerman}`);
    console.log(`- Remaining:  ${remaining}`);
    console.log(`- Progress:   ${percent}%`);
}

checkProgress();
