const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('🔍 Checking Total Registry Count...');
    const { count, error } = await supabase
        .from('registry_recipes')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log(`✅ Total Recipes in DB: ${count}`);
    }
}

check();
