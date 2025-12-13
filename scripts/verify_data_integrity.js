
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyIntegrity() {
    console.log("🔍 INSPECTING LATEST PROCESSED RECIPES...");

    // Fetch the last 3 recipes processed (IDs usually around 1541 based on logs)
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .order('id', { ascending: false })
        .limit(3);

    if (error) {
        console.error("❌ DB Error:", error);
        return;
    }

    console.log(`✅ Retrieved ${recipes.length} recipes.`);

    recipes.forEach(r => {
        console.log(`\n--------------------------------------------------`);
        console.log(`🆔 ID: ${r.id} | Name: ${r.name} | Name_En: ${r.name_en}`);
        console.log(`--------------------------------------------------`);

        console.log(`📄 ROOT DESCRIPTION COLUMN:`);
        console.log(`   "${r.description ? r.description.slice(0, 50) + '...' : 'NULL'}"`);

        console.log(`\n🥦 NUTRITION_INFO JSON (Where AI writes):`);
        if (r.nutrition_info) {
            console.log(JSON.stringify(r.nutrition_info, null, 2));
        } else {
            console.log("   ❌ NULL");
        }

        console.log(`\n🔗 SLUG: ${r.slug}`);
    });
}

verifyIntegrity();
