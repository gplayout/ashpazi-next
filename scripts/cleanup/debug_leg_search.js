const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function search() {
    console.log("Searching for 'Polo' (Rice) in legacy table...");
    const { data } = await supabase.from('recipes').select('id, name').ilike('name_en', '%Polo%').limit(5);
    console.log(data);
}
search();
