require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    const { data: ings } = await supabase
        .from('ingredient_translations')
        .select('name')
        .eq('language_code', 'fa')
        .limit(5);

    const { data: units } = await supabase
        .from('unit_translations')
        .select('name')
        .eq('language_code', 'fa')
        .limit(5);

    console.log('VALID_INGS:', JSON.stringify(ings.map(i => i.name)));
    console.log('VALID_UNITS:', JSON.stringify(units.map(u => u.name)));
}

run();
