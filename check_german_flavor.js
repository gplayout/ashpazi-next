
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFlavor() {
    const id = '616b36cb-d9dc-40cf-80fe-3bbaae257386';
    const { data } = await supabase
        .from('content_translations')
        .select('qa_metadata')
        .eq('recipe_id', id)
        .eq('language_code', 'de')
        .single();

    if (data && data.qa_metadata?.flavor_profile) {
        console.log("✅ Flavor Profile Found:", data.qa_metadata.flavor_profile);
    } else {
        console.log("❌ Flavor Profile MISSING for this German recipe.");
    }
}

checkFlavor();
