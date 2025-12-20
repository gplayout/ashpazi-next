
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getRestoredLinks() {
    // 1. Find Restored Legacy recipes
    const { data: restoredTranslations, error } = await client
        .from('content_translations')
        .select('recipe_id, title')
        .eq('qa_metadata->>category', 'Restored Legacy')
        .eq('language_code', 'en') // Get English title for reference
        .limit(50);

    if (error) {
        console.error("Error fetching restored recipes:", error);
        return;
    }

    if (!restoredTranslations || restoredTranslations.length === 0) {
        console.log("No 'Restored Legacy' recipes found.");
        return;
    }

    // 2. Check which ones have valid images in 'recipes' table
    const { data: recipesWithImages } = await client
        .from('recipes')
        .select('uuid, image_url')
        .in('uuid', restoredTranslations.map(r => r.recipe_id))
        .not('image_url', 'is', null)
        .not('image_url', 'ilike', '%placeholder%');

    // Filter translations to only those with valid images
    const validRestored = restoredTranslations.filter(t =>
        recipesWithImages.some(r => r.uuid === t.recipe_id)
    );

    console.log(`Found ${validRestored.length} restored recipes with images.`);

    // 3. Pick 3 random
    const shuffled = validRestored.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    console.log("\n🖼️  3 Restored Recipes with New Images:\n");
    selected.forEach((t, i) => {
        console.log(`${i + 1}. ${t.title}`);
        console.log(`   http://localhost:3000/recipe/${t.recipe_id}?lang=de`); // Providing DE link as we are in DE rollout, or EN? User asked for verification of the *images* for the 17 restored. Maybe EN is safer or just generic. The link works for any lang usually or defaults. Let's provide generic link or with lang query. I'll stick to DE since we are in DE mode, or maybe EN since the restoration was "Restored Legacy". Let's provide both or just the base. The user context is "German Content Rollout", but the restoration was "concurrent". The images are lang-agnostic. I'll provide DE links to be consistent giving they are likely testing the whole experience.
    });
}

getRestoredLinks();
