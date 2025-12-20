
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize OpenAI (Correct v4 syntax)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateImages() {
    console.log("🎨 Starting Image Generation for Restored Recipes...");

    // 1. Find Restored Legacy recipes without images
    // We look for category 'Restored Legacy'
    // AND where image_url is null OR contains 'placeholder'
    const { data: recipes, error } = await client
        .from('content_translations')
        .select(`
            recipe_id,
            title,
            qa_metadata
        `)
        .eq('qa_metadata->>category', 'Restored Legacy')
        .is('image_url', null); // Simplified check first

    // Note: The schema might check 'recipes' table for image_url, or 'content_translations'.
    // The App uses 'recipes.image_url' usually.
    // Let's check 'recipes' table for the 17 items.

    // Better strategy: Use the known list of 17 restored IDs if possible, or fetch them via category from translations
    // Let's query 'recipes' joined with translations to get the category.

    // Actually, let's just use the `find_restored.js` logic (fetch by IDs or category).
    // Queries on JSONB 'qa_metadata' might be slow but valid.

    if (error) {
        console.error("Fetch Error:", error);
        return;
    }

    // Since we can't easily join on JSON filter in JS client sometimes, let's just fetch all 'Restored Legacy' from translations
    // and then check their image_url in `recipes`.

    const { data: restoredTranslations } = await client
        .from('content_translations')
        .select('recipe_id, title, language_code')
        .eq('qa_metadata->>category', 'Restored Legacy')
        .eq('language_code', 'en'); // Get English title for prompt

    if (!restoredTranslations || restoredTranslations.length === 0) {
        console.log("No 'Restored Legacy' recipes found.");
        return;
    }

    console.log(`Found ${restoredTranslations.length} restored candidates.`);

    // Check which ones need images
    const { data: recipeRows } = await client
        .from('recipes')
        .select('id, uuid, image_url')
        .in('uuid', restoredTranslations.map(r => r.recipe_id));

    const targets = recipeRows.filter(r => !r.image_url || r.image_url.includes('placeholder'));
    console.log(`Targets needing images: ${targets.length}`);

    for (const target of targets) {
        const meta = restoredTranslations.find(t => t.recipe_id === target.uuid);
        const prompt = `Professional food photography of ${meta.title}, centered, high resolution, vibrant colors, 4k`;

        console.log(`\nGenerating for: ${meta.title} (${target.uuid})...`);

        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                style: "natural"
            });

            const imageUrl = response.data[0].url;
            console.log(`   > Generated: ${imageUrl.substring(0, 30)}...`);

            // Save to DB
            const { error: updateError } = await client
                .from('recipes')
                .update({ image_url: imageUrl })
                .eq('uuid', target.uuid);

            if (updateError) console.error("   > DB Update Failed:", updateError);
            else console.log("   > Saved to DB ✅");

        } catch (e) {
            console.error("   > Generation Failed:", e.message);
        }

        // Wait 5s to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

generateImages();
