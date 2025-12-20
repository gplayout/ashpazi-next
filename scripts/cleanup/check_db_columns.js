const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
    // We can't easily query schema via JS client without RPC sometimes, but we can try inserting a dummy row with extra keys and see if it fails, or check a generic query.
    // Or just "select" top 1 and look at keys.
    // Better: Try to update one row with a new key and see if error.

    console.log("Checking table structure...");
    const { error } = await supabase.from('content_translations').select('nutrition, internal_score').limit(1);

    if (error) {
        console.log("Columns likely MISSING:", error.message);
        console.log("We probably need to add 'nutrition' (jsonb) and 'internal_score' (jsonb) columns.");
    } else {
        console.log("Columns EXIST/ACCESSIBLE.");
    }
}

checkColumns();
