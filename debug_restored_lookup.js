
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugLookup() {
    console.log("Searching for 'Restored Legacy'...");

    // 1. Broad Search
    const { data: rows, error } = await client
        .from('content_translations')
        .select('recipe_id, title, qa_metadata, language_code')
        .ilike('qa_metadata->>category', '%Legacy%')
        .limit(20);

    if (error) console.error(error);

    console.log(`Found: ${rows?.length}`);
    rows?.forEach(r => {
        console.log(`- [${r.language_code}] ${r.title} (Cat: ${r.qa_metadata?.category}) ID: ${r.recipe_id}`);
    });

    if (rows && rows.length > 0) {
        // Pick 3 and print links right here
        console.log("\n🧪 Verification Links (Generated from Debug):");
        rows.slice(0, 3).forEach(r => {
            console.log(`- http://localhost:3000/recipe/${r.recipe_id}?lang=${r.language_code}`);
        });
    }
}

debugLookup();
