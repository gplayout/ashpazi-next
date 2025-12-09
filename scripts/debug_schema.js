const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
    console.log("--- Checking DB Schema ---");
    // Fetch one recipe to inspect keys
    const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .limit(1);

    if (error) { console.error("Error:", error); return; }

    if (data && data.length > 0) {
        console.log("Columns present in 'recipes' table:");
        console.log(Object.keys(data[0]));
    } else {
        console.log("Table is empty or not accessible.");
    }
}

checkSchema();
