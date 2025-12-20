
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSchema() {
    const { data, error } = await client
        .from('recipes')
        .select('*')
        .limit(1);

    if (error) console.error(error);
    if (data && data.length > 0) {
        console.log("Recipes Table Keys:", Object.keys(data[0]));
    } else {
        console.log("No data found.");
    }
}

inspectSchema();
