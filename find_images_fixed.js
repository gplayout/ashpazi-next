
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findImagesFixed() {
    // 1. Find recipes with http images using 'id'
    const { data: recipes, error } = await client
        .from('recipes')
        .select('id, image_url')
        .ilike('image_url', 'http%')
        .limit(20);

    if (error) {
        console.error("Error fetching recipes:", error);
        return;
    }

    if (!recipes || recipes.length === 0) {
        console.log("No recipes with 'http' images found.");
        return;
    }

    // 2. Fetch titles
    const ids = recipes.map(r => r.id);
    const { data: translations } = await client
        .from('content_translations')
        .select('recipe_id, title')
        .in('recipe_id', ids) // content_translations probably uses recipe_id which matches recipes.id
        .eq('language_code', 'en');

    console.log(`Found ${recipes.length} recipes with images.`);

    // Pick 3 from the list (or less if fewer)
    const selected = recipes.slice(0, 3);

    console.log("📸 Recipes with Generated Images:\n");
    selected.forEach((r, i) => {
        const titleRow = translations?.find(t => t.recipe_id === r.id);
        const title = titleRow ? titleRow.title : 'Details Below';

        console.log(`${i + 1}. ${title} (ID: ${r.id})`);
        console.log(`   http://localhost:3000/recipe/${r.id}?lang=de`);
        console.log(`   [Image URL]: ${r.image_url.substring(0, 30)}...`);
        console.log("");
    });
}

findImagesFixed();
