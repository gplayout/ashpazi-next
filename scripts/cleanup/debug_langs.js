const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkLangs() {
    console.log("Checking language distribution...");
    const { data, error } = await supabase.from('content_translations').select('language_code');
    if (error) return console.log(error);

    const counts = {};
    data.forEach(r => {
        const k = r.language_code === '' ? '(empty)' : (r.language_code || '(null)');
        counts[k] = (counts[k] || 0) + 1;
    });
    console.log(counts);
}
checkLangs();
