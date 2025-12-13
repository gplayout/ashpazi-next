
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDuplicates() {
    console.log("🔍 Checking for duplicate recipes...");

    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('name, name_en');

    if (error) {
        console.error(error);
        return;
    }

    const nameMap = {};
    const enNameMap = {};

    recipes.forEach(r => {
        if (r.name) {
            const norm = r.name.toLowerCase().trim();
            nameMap[norm] = (nameMap[norm] || 0) + 1;
        }
        if (r.name_en) {
            const norm = r.name_en.toLowerCase().trim();
            enNameMap[norm] = (enNameMap[norm] || 0) + 1;
        }
    });

    const dupes = Object.entries(enNameMap).filter(([k, v]) => v > 1);

    console.log(`\n📊 Found ${dupes.length} Duplicate Names (English):`);
    dupes.sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([name, count]) => {
        console.log(`   - "${name}": ${count} times`);
    });

    if (dupes.length === 0) console.log("   ✅ No exact text duplicates found.");
}

checkDuplicates();
