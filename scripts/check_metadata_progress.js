
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log("📊 Checking Metadata Update Progress...");

    // Get top 50 IDs
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name_en, nutrition_info')
        .order('id', { ascending: false })
        .limit(50);

    if (error) {
        console.error(error);
        return;
    }

    let updated = 0;
    let pending = 0;

    recipes.forEach(r => {
        // Check if nutrition_info has 'origin' key (added in second pass)
        if (r.nutrition_info && r.nutrition_info.fa && r.nutrition_info.fa.origin) {
            updated++;
        } else {
            pending++;
        }
    });

    console.log(`✅ Updated with Metadata: ${updated}`);
    console.log(`⏳ Pending: ${pending}`);
    console.log(`📉 Total: ${recipes.length}`);

    if (updated > 0) {
        const last = recipes.find(r => r.nutrition_info?.fa?.origin);
        console.log("Sample Updated:", last.name_en, "| Origin:", last.nutrition_info.fa.origin);
    }
}

main();
