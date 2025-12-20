require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function searchMacaroni() {
    const { data: rows } = await supabase
        .from('recipes')
        .select('id, name, category, slug')
        .ilike('name', '%Macaroni%')
        .limit(5);

    console.log("Found:", rows);
}

searchMacaroni();
