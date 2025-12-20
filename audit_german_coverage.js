
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function auditGerman() {
    // 1. Count Total Active Legacy Recipes
    const { count: totalRecipes, error: err1 } = await client
        .from('recipes')
        .select('*', { count: 'exact', head: true });

    // 2. Count Total German Translations
    const { count: totalGerman, error: err2 } = await client
        .from('content_translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'de')
        .eq('publish_status', 'published');

    // 3. Check for "New Format" markers in a sample
    // (We check if 'qa_metadata' contains 'flavor_profile' which is specific to our new schema)
    const { data: sample, error: err3 } = await client
        .from('content_translations')
        .select('qa_metadata')
        .eq('language_code', 'de')
        .eq('publish_status', 'published')
        .not('qa_metadata', 'is', null)
        .limit(100);

    const richCount = sample ? sample.filter(t => t.qa_metadata?.flavor_profile).length : 0;

    console.log("📊 German Content Audit:");
    console.log(`- Total Legacy Recipes: ${totalRecipes}`);
    console.log(`- Total German Translations: ${totalGerman}`);
    console.log(`- Sample Size for Quality Check: ${sample?.length || 0}`);
    console.log(`- Rich Format Rate in Sample: ${richCount}%`); // valid logic since limit 100

    if (totalGerman >= totalRecipes * 0.95) {
        console.log("✅ Coverage: EXCELLENT (>95%)");
    } else {
        console.log(`⚠️ Coverage: PARTIAL (${Math.round((totalGerman / totalRecipes) * 100)}%)`);
    }
}

auditGerman();
