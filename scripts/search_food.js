const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function searchFood() {
    console.log("--- Searching for Non-Persian SKUs ---");

    const terms = ['taco', 'mexican', 'burger', 'pizza', 'pasta'];

    for (const term of terms) {
        console.log(`\nSearching for: "${term}"`);
        const { data } = await supabase
            .from('recipes')
            .select('id, name, name_en')
            .or(`name.ilike.%${term}%,name_en.ilike.%${term}%`)
            .limit(3);

        if (data && data.length > 0) {
            console.log("✅ FOUND:", data);
        } else {
            console.log("❌ Not Found");
        }
    }
}

searchFood();
