
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findRestored() {
    console.log("🔍 Searching for category 'Restored Legacy'...");

    const { data: recipes, error } = await supabase
        .from('recipes')
        .select(`id, name, created_at`)
        .eq('category', 'Restored Legacy');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`✅ Found ${recipes.length} restored recipes.`);
        recipes.forEach(r => {
            console.log(`   - [${r.id}] ${r.name}`);
        });
    }
}

findRestored();
