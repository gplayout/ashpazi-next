
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findImagesNoJoin() {
    // 1. Find recipes with http images
    const { data: recipes, error } = await client
        .from('recipes')
        .select('uuid, image_url')
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

    console.log(`Found ${recipes.length} recipes with images.`);
    const selected = recipes.slice(0, 3);

    // 2. Fetch titles for these
    const ids = selected.map(r => r.uuid);
    const { data: translations } = await client
        .from('content_translations')
        .select('recipe_id, title, language_code')
        .in('recipe_id', ids)
        .eq('language_code', 'en'); // Prefer EN title

    console.log("📸 Recipes with Images (Links):\n");
    selected.forEach((r, i) => {
        const titleRow = translations.find(t => t.recipe_id === r.uuid);
        const title = titleRow ? titleRow.title : 'Unknown Title';

        console.log(`${i + 1}. ${title}`);
        console.log(`   http://localhost:3000/recipe/${r.uuid}?lang=de`);
        console.log(`   (Image: ${r.image_url ? r.image_url.substring(0, 30) + '...' : 'None'})`);
    });
}

findImagesNoJoin();
