const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    console.log("--- Inspecting Recipe Data for 'Evidence' of Agents ---");

    // 1. Check for 'perfectionist' images (signature of chef_perfectionist.js)
    const { data: examples, error } = await supabase
        .from('recipes')
        .select('id, name, image')
        .ilike('image', '%perfectionist/%') // Search for signature path
        .limit(5);

    if (error) { console.error("DB Error:", error); return; }

    if (examples.length > 0) {
        console.log(`\nFound ${examples.length} recipes with 'perfectionist' images (Agent DID run):`);
        examples.forEach(r => console.log(`- [${r.id}] ${r.name}: ${r.image}`));
    } else {
        console.log("\nNo recipes found with 'perfectionist' image paths in DB.");
    }

    // 2. Check a few random recipes to see what they DO have
    const { data: randoms } = await supabase
        .from('recipes')
        .select('id, name, image')
        .range(50, 55);

    console.log("\nRandom Sample of current data:");
    randoms.forEach(r => console.log(`- [${r.id}] ${r.name}: ${r.image || 'NULL'}`));
}

inspect();
