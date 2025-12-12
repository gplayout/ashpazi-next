
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    const { data } = await supabase
        .from('recipes')
        .select('name_en, image')
        .order('id', { ascending: false })
        .limit(5);

    console.log(JSON.stringify(data, null, 2));
}

main();
