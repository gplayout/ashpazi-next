const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { count } = await supabase
        .from('content_translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'en');

    console.log(`\n📊 Chef Zaffaron Progress: ${count} / 1527 Recipes Completed.\n`);
}

check();
