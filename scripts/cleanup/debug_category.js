require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLegacyCategory() {
    console.log("🔍 Checking Legacy 'category' field for ID 22...");

    // Get legacy info
    const { data: recipe } = await supabase
        .from('recipes')
        .select('id, name, category, original_title')
        .eq('id', 22)
        .single();

    if (recipe) {
        console.log(`🆔 ID: ${recipe.id}`);
        console.log(`👉 Category: '${recipe.category}'`);
        console.log(`👉 Name: '${recipe.name}'`);
    } else {
        console.log("❌ Recipe 22 not found in 'recipes' table");
    }
}

checkLegacyCategory();
