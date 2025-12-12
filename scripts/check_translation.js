const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    console.log("Checking translations for ID 1136...");

    const { data, error } = await supabase
        .from('recipe_translations')
        .select('*')
        .eq('recipe_id', 1136);

    if (error) console.error(error);
    else console.log(data);
}

check();
