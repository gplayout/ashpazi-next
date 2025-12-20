
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findImages() {
    // Check for any image_url that looks like a remote URL (http)
    const { data: recipes, error } = await client
        .from('recipes')
        .select(`
            uuid, 
            image_url,
            content_translations (title, language_code) 
        `)
        .ilike('image_url', 'http%')
        .limit(20);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (!recipes || recipes.length === 0) {
        console.log("No recipes with 'http%' images found.");
        // Try filtering not null
        const { data: recipesNotNull } = await client
            .from('recipes')
            .select('uuid, image_url')
            .not('image_url', 'is', null)
            .limit(5);
        console.log("Recipes with NOT NULL images:", recipesNotNull);
        return;
    }

    console.log(`Found ${recipes.length} recipes with images.`);

    // Filter for DALL-E or OpenAI specific if possible, or just take them
    // Usually restored text images come from oaidalle or similar.

    const valid = recipes.filter(r => r.image_url.includes('oai') || r.image_url.includes('dalle') || r.image_url.length > 50);

    // Pick 3
    const selected = valid.slice(0, 3);

    console.log("📸 Recipes with Images:\n");
    selected.forEach((r, i) => {
        // Find DE title if available, else EN, else any
        const titleObj = r.content_translations?.find(t => t.language_code === 'de') || r.content_translations?.find(t => t.language_code === 'en') || r.content_translations?.[0];
        const title = titleObj ? titleObj.title : 'Untitled';

        console.log(`${i + 1}. ${title}`);
        console.log(`   http://localhost:3000/recipe/${r.uuid}?lang=de`);
        console.log(`   (Image: ${r.image_url.substring(0, 40)}...)`);
    });
}

findImages();
