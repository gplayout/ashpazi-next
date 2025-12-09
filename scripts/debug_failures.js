const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkFailures() {
    const names = [
        "خوراک سیب زمینی با گردو", // Potato Stew with Walnuts
        "خوراک اسفناج و کالباس",   // Spinach and Sausage Dish
        "قلیه کدو حلوایی"          // Gheimeh Kadoo Halvai
    ];

    console.log("--- Investigating User-Reported Failures ---");

    for (const name of names) {
        // Search by partial name to be safe
        const { data, error } = await supabase
            .from('recipes')
            .select('id, name, image')
            .ilike('name', `%${name}%`);

        if (error) { console.error(`Error finding ${name}:`, error.message); continue; }

        if (data && data.length > 0) {
            data.forEach(r => {
                console.log(`\n🍲 Recipe: ${r.name}`);
                console.log(`   ID: ${r.id}`);
                console.log(`   Image URL: ${r.image}`);

                // Check if it was in our batch (18-67)
                const inBatch = (r.id >= 18 && r.id <= 67);
                console.log(`   In Batch (18-67)? ${inBatch ? "YES" : "NO"}`);
            });
        } else {
            console.log(`\n❌ Could not find recipe matching: "${name}"`);
        }
    }
}

checkFailures();
