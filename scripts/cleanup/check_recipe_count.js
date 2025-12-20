require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function countRecipes() {
    console.log("📊 Counting Recipes...");

    // 1. Count Total Recipes
    const { count: totalRecipes, error: err1 } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true });

    if (err1) console.error("Error counting recipes:", err1.message);
    else console.log(`✅ Total 'recipes' table count: ${totalRecipes}`);

    // 2. Count Pipeline State (Tracked)
    const { count: trackedRecipes, error: err2 } = await supabase
        .from('recipe_pipeline_state')
        .select('*', { count: 'exact', head: true });

    if (err2) console.error("Error counting pipeline state:", err2.message);
    else console.log(`✅ Total 'recipe_pipeline_state' count: ${trackedRecipes}`);

    // 3. Check for any ID gaps or weirdness (optional, but good for "exactness")
    const { data: maxId } = await supabase
        .from('recipes')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();

    if (maxId) console.log(`ℹ️ Max Recipe ID: ${maxId.id}`);
}

countRecipes();
