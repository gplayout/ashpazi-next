
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectKeys() {
    const { data: recipes, error } = await client
        .from('recipes')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (recipes && recipes.length > 0) {
        console.log("Recipes Table Keys:", Object.keys(recipes[0]));
    } else {
        console.log("Recipes table is empty or error.");
    }

    // Check translations keys too
    const { data: trans } = await client
        .from('content_translations')
        .select('*')
        .limit(1);

    if (trans && trans.length > 0) {
        console.log("Translations Table Keys:", Object.keys(trans[0]));
    }
}

inspectKeys();
