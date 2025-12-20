const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findSmart() {
    const snippet = "%traces its roots%";
    console.log(`Searching DB for marketing_description like "${snippet}"...`);

    // Supabase filtering on JSONB property
    // syntax: column ->> key
    const { data, error } = await supabase
        .from('content_translations')
        .select('recipe_id, title')
        // This relies on PostgREST arrow operators being exposed or using a raw filter usually...
        // But supabase-js might need .filter('qa_metadata->>marketing_description', 'ilike', snippet)
        .filter('qa_metadata->>marketing_description', 'ilike', snippet);

    if (error) {
        console.log("Error:", error);
    } else if (data && data.length > 0) {
        console.log("✅ FOUND MATCHES!");
        const found = data[0];
        console.log(`Title: ${found.title}`);
        console.log(`UUID: ${found.recipe_id}`);

        // Find Legacy ID
        const { data: reg } = await supabase.from('registry_recipes').select('legacy_recipe_id').eq('id', found.recipe_id).single();
        console.log(`Legacy ID: ${reg?.legacy_recipe_id}`);
    } else {
        console.log("❌ No matches in marketing_description.");
        // Try instructions text scan again but with pagination if needed, or assume it's lost.
    }
}

findSmart();
