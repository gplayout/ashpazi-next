
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugRecipes() {
    // 1. Check what categories exist
    // fetching a sample to see metadata structure
    const { data: sample, error } = await client
        .from('content_translations')
        .select('qa_metadata')
        .not('qa_metadata', 'is', null)
        .limit(20);

    if (sample) {
        console.log("Sample metadata categories:");
        sample.forEach(s => {
            if (s.qa_metadata && s.qa_metadata.category) {
                console.log(" - " + s.qa_metadata.category);
            }
        });
    }

    // 2. Count recipes with valid images
    const { count: imageCount, error: imgError } = await client
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .not('image_url', 'is', null)
        .not('image_url', 'ilike', '%placeholder%');

    console.log(`\nRecipes with valid images: ${imageCount}`);

    // 3. Just fetch 3 with images if we can't find specific category
    if (imageCount > 0) {
        const { data: recipesWithImages } = await client
            .from('recipes')
            .select(`
                uuid, 
                image_url,
                content_translations!inner(title, language_code)
            `)
            .eq('content_translations.language_code', 'en')
            .not('image_url', 'is', null)
            .not('image_url', 'ilike', '%placeholder%')
            .limit(5);

        if (recipesWithImages) {
            console.log("\nSample recipes with images:");
            recipesWithImages.forEach(r => {
                console.log(` - ${r.content_translations[0]?.title} (${r.uuid})`);
            });
        }
    }
}

debugRecipes();
