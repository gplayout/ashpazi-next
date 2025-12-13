
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    const slug = "Tlatlocolotl";
    console.log(`🔎 Testing slug lookup for: "${slug}"`);

    const decoded = decodeURIComponent(slug);
    const normalized = decoded.replace(/-/g, ' ');

    console.log(`   Normalized: "${normalized}"`);

    // 1. Search Translations
    console.log("1️⃣ Searching recipe_translations...");
    const { data: translations, error: tErr } = await supabase
        .from('recipe_translations')
        .select('*')
        .or(`title.eq.${normalized},title.ilike.${normalized}`);

    if (tErr) console.error("   ❌ Error:", tErr.message);
    console.log(`   Found ${translations?.length || 0} matches:`, translations);

    // 2. Search Main Table (Name)
    console.log("2️⃣ Searching recipes (name)...");
    const { data: recipes, error: rErr } = await supabase
        .from('recipes')
        .select('id, name, name_en')
        .or(`name.eq.${normalized},name.ilike.${normalized}`);

    if (rErr) console.error("   ❌ Error:", rErr.message);
    console.log(`   Found ${recipes?.length || 0} matches:`, recipes);

    // 3. Search Main Table (name_en) - Potential Fix?
    console.log("3️⃣ Searching recipes (name_en)...");
    const { data: recipesEn, error: reErr } = await supabase
        .from('recipes')
        .select('id, name, name_en')
        .or(`name_en.eq.${normalized},name_en.ilike.${normalized}`);

    if (reErr) console.error("   ❌ Error:", reErr.message);
    console.log(`   Found ${recipesEn?.length || 0} matches:`, recipesEn);
}

main();
