
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
    const { data, error } = await supabase
        .from('recipes')
        .select('id, nutrition_info')
        .eq('id', 251) // One of the known completed ones
        .single();

    if (error) console.error(error);
    else console.log(JSON.stringify(data.nutrition_info, null, 2));
}

inspect();
