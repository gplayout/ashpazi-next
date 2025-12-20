
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
    console.log("Diagnosing Homepage Data Issues...");

    // 1. Check Image Status
    const { count: total, error: countErr } = await supabase.from('recipes').select('*', { count: 'exact', head: true });
    const { count: nullImages, error: nullErr } = await supabase.from('recipes').select('*', { count: 'exact', head: true }).is('image', null);

    console.log(`Total Recipes: ${total}`);
    console.log(`Recipes with NULL image: ${nullImages}`);

    // 2. Check Categories (Detect Language Leak)
    // We fetch a sample of categories to see if they are German
    const { data: categories, error: catErr } = await supabase
        .from('recipes')
        .select('category')
        .limit(100);

    if (categories) {
        const uniqueCats = [...new Set(categories.map(c => c.category))];
        console.log("\nSample Categories in 'recipes' table:", uniqueCats.slice(0, 20)); // Limit to 20
    }

    // 3. Simulate Homepage Query (Initial Load)
    const { data: homeRecipes, error: homeErr } = await supabase
        .from('recipes')
        .select('id, name, image, category')
        .not('image', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

    if (homeErr) {
        console.error("Homepage Fetch Error:", homeErr);
    } else {
        console.log("\nHomepage Query (First 5):");
        homeRecipes.forEach(r => {
            console.log(`- [${r.id}] ${r.name} | Img: ${r.image ? '✅' : '❌'} | Cat: ${r.category}`);
        });
    }

}

diagnose();
