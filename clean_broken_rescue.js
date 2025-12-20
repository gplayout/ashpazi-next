
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanBroken() {
    console.log("🧹 Cleaning broken 'Restored Legacy' recipes...");

    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id')
        .eq('category', 'Restored Legacy');

    if (recipes && recipes.length > 0) {
        const ids = recipes.map(r => r.id);
        console.log(`Found ${ids.length} items to delete:`, ids);

        const { error: delErr } = await supabase
            .from('recipes')
            .delete()
            .in('id', ids);

        if (delErr) {
            console.error("❌ Delete failed:", delErr.message);
        } else {
            console.log("✅ Broken rows deleted.");
        }
    } else {
        console.log("✅ No broken rows found.");
    }
}

cleanBroken();
