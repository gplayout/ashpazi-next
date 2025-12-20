
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecipe() {
    console.log('Checking Recipe 1541...');
    const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', 1541)
        .single();

    if (error) {
        console.error('Error fetching recipe:', error);
    } else {
        console.log('Recipe Found. Keys:', Object.keys(data));
        // console.log('Full Data:', JSON.stringify(data, null, 2));
    }
}

checkRecipe();
