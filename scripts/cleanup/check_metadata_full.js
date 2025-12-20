const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkMetadata() {
    console.log('Checking latest translation metadata...');
    const { data: latest } = await supabase
        .from('content_translations')
        .select('title, qa_metadata')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

    if (latest) {
        console.log('Title:', latest.title);
        console.log('Metadata:', JSON.stringify(latest.qa_metadata, null, 2));
    } else {
        console.log('No data found.');
    }
}

checkMetadata();
