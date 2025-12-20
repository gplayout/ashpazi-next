
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findSoupJo() {
    console.log("=== FIND SOUP JO ===");

    // Search by English Name
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, name_en')
        .ilike('name_en', '%Soup Jo%')
        .limit(5);

    if (error) { console.error("Search Error:", error); return; }

    if (recipes.length === 0) {
        console.log("No 'Soup Jo' found.");
        return;
    }

    recipes.forEach(r => {
        console.log(`ID: ${r.id} | Name: ${r.name_en} | Original: ${r.name}`);
    });
}

findSoupJo();
