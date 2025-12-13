
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log("📊 Checking Agent Progress...");

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

    let processed = 0;
    let pending = 0;

    recipes.forEach(r => {
        // Check if nutrition_info has 'validation' key (added by agent)
        if (r.nutrition_info && r.nutrition_info.validation) {
            processed++;
        } else {
            pending++;
        }
    });

    console.log(`✅ Processed: ${processed}`);
    console.log(`⏳ Pending: ${pending}`);
    console.log(`📉 Total: ${recipes.length}`);

    if (processed > 0) {
        console.log("Last processed:", recipes.find(r => r.nutrition_info && r.nutrition_info.validation).name_en);
    }
}

main();
