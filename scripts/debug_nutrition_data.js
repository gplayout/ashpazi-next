
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugNutrition() {
    console.log("🥗 Checking Nutrition Data...");

    // Fetch a recipe that SHOULD have data
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, nutrition_info')
        .limit(5);

    if (error) {
        console.error("DB Error:", error);
        return;
    }

    recipes.forEach(r => {
        console.log(`\nRecipe: ${r.name} (${r.id})`);
        if (!r.nutrition_info) {
            console.log("   ❌ No nutrition_info");
        } else {
            const keys = Object.keys(r.nutrition_info);
            console.log(`   Keys: ${keys.join(', ')}`);

            if (r.nutrition_info.en) {
                console.log(`   🇺🇸 EN Insight: ${r.nutrition_info.en.chef_insight}`);
            } else {
                console.log("   ❌ Missing EN data");
            }

            if (r.nutrition_info.fa) {
                console.log(`   🇮🇷 FA Insight: ${r.nutrition_info.fa.chef_insight}`);
            }
        }
    });
}

debugNutrition();
