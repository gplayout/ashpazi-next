const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkRecipe() {
    console.log("--- Investigating Recipe Text ---");
    // Search for "Spicy Bean Stew" or "خوراک تند با لوبیا"
    const { data, error } = await supabase
        .from('recipes')
        .select('id, name, name_en, ingredients, ingredients_en, instructions, instructions_en')
        .ilike('name', '%خوراک تند با لوبیا%')
        .limit(1);

    if (error) { console.error("Error:", error); return; }

    if (data && data.length > 0) {
        const r = data[0];
        console.log(`id: ${r.id}`);
        console.log(`name: ${r.name}`);
        console.log(`name_en: ${r.name_en}`);
        console.log(`ingredients (${typeof r.ingredients}):`, r.ingredients);
        console.log(`instructions (${typeof r.instructions}):`, r.instructions);
        // Also verify what columns we actually have
        console.log("full record keys:", Object.keys(r));
    } else {
        console.log("Recipe not found.");
    }
}

checkRecipe();
