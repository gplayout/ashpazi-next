require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCategoryVariety() {
    console.log("🔍 Checking Category Variety...");

    // Fetch 50 categories from updated recipes
    const { data: recipes } = await supabase
        .from('recipes')
        .select('name, category')
        .gt('id', 100)
        .lt('id', 200)
        .order('id', { ascending: true });

    const counts = {};
    recipes.forEach(r => {
        const cat = r.category || 'NULL';
        counts[cat] = (counts[cat] || 0) + 1;
    });

    console.log("📊 Category Distribution:", counts);
}

checkCategoryVariety();
