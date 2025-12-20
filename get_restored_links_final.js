
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getRestored() {
    // 1. Find recipes with image starting with http
    // Using 'image' column based on inspection
    const { data: recipes, error } = await client
        .from('recipes')
        .select('id, image')
        .ilike('image', 'http%')
        .limit(20);

    if (error) {
        console.error("Error fetching recipes:", error);
        return;
    }

    if (!recipes || recipes.length === 0) {
        console.log("No recipes with images found.");
        return;
    }

    console.log(`Found ${recipes.length} recipes with images.`);

    // Pick 3 from the list
    const selected = recipes.slice(0, 3);
    const ids = selected.map(r => r.id);

    // 2. Fetch German Titles
    const { data: translations } = await client
        .from('content_translations')
        .select('recipe_id, title')
        .in('recipe_id', ids)
        .eq('language_code', 'de');

    console.log("🖼️  3 Verified Recipes with New Images:\n");
    selected.forEach((r, i) => {
        const titleRow = translations?.find(t => t.recipe_id === r.id);
        const title = titleRow ? titleRow.title : 'Details Below'; // Fallback if DE translation missing

        console.log(`${i + 1}. ${title}`);
        console.log(`   http://localhost:3000/recipe/${r.id}?lang=de`);
        // console.log(`   (Image: ${r.image.substring(0, 30)}...)`);
        console.log("");
    });
}

getRestored();
