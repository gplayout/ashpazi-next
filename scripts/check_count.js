
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function count() {
    console.log("Checking DB count...");
    const { count, error } = await supabase.from('recipes').select('*', { count: 'exact', head: true });
    if (error) console.error(error);
    else console.log('Total Count in DB:', count);
}

count();
