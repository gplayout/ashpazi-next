
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getUrl() {
    const { data } = await supabase
        .from('recipes')
        .select('image')
        .ilike('image', '%oaidalle%')
        .limit(1)
        .single();

    if (data) {
        console.log("FULL_URL:", data.image);
    } else {
        console.log("No DALL-E URL found.");
    }
}

getUrl();
