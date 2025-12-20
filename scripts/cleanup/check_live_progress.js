const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkLive() {
    console.log('Checking live activity...');

    // 1. Count
    const { count } = await supabase.from('content_translations').select('*', { count: 'exact', head: true });
    console.log('Total Translations:', count);

    // 2. Latest 3
    const { data: latest } = await supabase
        .from('content_translations')
        .select('title, language_code, instructions, last_updated')
        .order('last_updated', { ascending: false })
        .limit(3);

    if (latest && latest.length > 0) {
        console.log('\n--- Latest Entries ---');
        latest.forEach((t, i) => {
            console.log(`[${i + 1}] Lang: ${t.language_code} | Title: ${t.title}`);
            console.log(`    Updated: ${new Date(t.last_updated).toISOString()}`);
            // Check for Saffron signature
            const jsonStr = JSON.stringify(t.instructions);
            const hasSaffron = jsonStr.toLowerCase().includes('saffron') || jsonStr.toLowerCase().includes('zaffaron');
            console.log(`    Has Chef Zaffaron Touch? ${hasSaffron ? 'YES ✅' : 'No ❌'}`);
        });
    } else {
        console.log('No recent entries found yet.');
    }
}

checkLive();
