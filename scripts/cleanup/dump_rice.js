const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function dumpRice() {
    console.log("Dumping all EN translations for 'Rice'...");

    const { data, error } = await supabase
        .from('content_translations')
        .select('recipe_id, title, instructions, qa_metadata')
        .eq('language_code', 'en')
        .ilike('title', '%Rice%'); // Broad filter

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${data.length} records.`);
    fs.writeFileSync('dump_rice.json', JSON.stringify(data, null, 2));
    console.log("Saved to dump_rice.json");
}

dumpRice();
