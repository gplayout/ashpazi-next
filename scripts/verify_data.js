const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkRecipeUpdates() {
    console.log('Checking recent recipe updates...');

    // Fetch 5 random recipes
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, instructions, created_at')
        .limit(5);

    if (error) {
        console.error('Error fetching recipes:', error);
        return;
    }

    recipes.forEach(r => {
        console.log(`\n--- Recipe: ${r.name} ---`);
        console.log(`Instructions type: ${typeof r.instructions}`);
        if (Array.isArray(r.instructions)) {
            console.log(`Format: Array of ${r.instructions.length} strings`);
            console.log('Sample:', r.instructions.slice(0, 2));
        } else {
            console.log('Format: String (Likely NOT updated or updated incorrectly)');
            console.log('Content Start:', r.instructions.substring(0, 100) + '...');
        }
    });
}

checkRecipeUpdates();
