
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspect() {
    const { data, error } = await supabase.from('recipes').select('*').limit(1);
    if (data && data.length > 0) {
        console.log("Columns found:", Object.keys(data[0]).join(", "));
    } else {
        console.log("No data found or error:", error);
    }
}

inspect();
