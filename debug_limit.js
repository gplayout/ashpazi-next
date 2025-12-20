
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugCounts() {
    const { data: recipes, error } = await client.from('recipes').select('id');
    console.log(`Recipes returned: ${recipes?.length}`);
    if (recipes?.length === 1000) {
        console.log("🚨 CONFIRMED: 1000 row limit hits!");
    }
}

debugCounts();
