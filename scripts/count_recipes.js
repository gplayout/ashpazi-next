const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function count() {
    // Using head: true to get count only
    const { count, error } = await supabase.from('registry_recipes').select('*', { count: 'exact', head: true });
    if (error) console.error(error);
    else console.log(`\n📊 EXACT RECIPE COUNT: ${count}\n`);
}
count();
