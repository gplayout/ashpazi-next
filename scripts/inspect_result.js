
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log("🔍 Inspecting Refined Recipe Data...");

    // Get the most recently updated recipe
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .order('id', { ascending: false })
        .limit(1);

    if (error) {
        console.error(error);
        return;
    }

    const r = recipes[0];
    console.log(`\n🍲 Recipe: ${r.name_en}`);
    console.log(`📂 Category: ${r.category}`);
    console.log(`⏱️ Prep: ${r.prep_time_minutes}`);

    console.log("\n📄 Nutrition Info (JSON):");
    console.log(JSON.stringify(r.nutrition_info, null, 2));

    console.log("\n🍖 Pork Check (Ingredients):");
    console.log(JSON.stringify(r.ingredients_en, null, 2));
}

main();
