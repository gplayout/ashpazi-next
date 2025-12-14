
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkImages() {
    const { count, error } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .not('image', 'is', null);

    console.log("Recipes with image:", count);
    if (error) console.error(error);
}

checkImages();
