
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

// Config
const DELAY_MS = 1000;

// Init
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
});

const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
    console.log("🎨 Starting DALL-E Backfill for missing images...");

    // 1. Fetch missing images
    // Fetch rows where image is null OR empty string
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name_en, category')
        .or('image.is.null,image.eq.""')
        .limit(50); // Batch limit

    if (error) {
        console.error("DB Error:", error.message);
        return;
    }

    if (!recipes || recipes.length === 0) {
        console.log("✅ No missing images found.");
        return;
    }

    console.log(`📋 Found ${recipes.length} recipes to illustrate.`);

    for (const recipe of recipes) {
        console.log(`\n👨‍🎨 Painting: ${recipe.name_en} (${recipe.category})...`);

        try {
            // Generate Image
            const prompt = `Professional food photography of ${recipe.name_en}, authentic ${recipe.category} cuisine, michelin star plating, high resolution, 8k, photorealistic, natural lighting.`;

            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                quality: "standard", // standard is faster/cheaper
            });

            const imageUrl = response.data[0].url;

            if (imageUrl) {
                // Update DB
                const { error: updateError } = await supabase
                    .from('recipes')
                    .update({ image: imageUrl })
                    .eq('id', recipe.id);

                if (updateError) {
                    console.error(`   ❌ DB Update Failed: ${updateError.message}`);
                } else {
                    console.log(`   ✅ Saved!`);
                }
            }

        } catch (e) {
            console.error(`   ❌ DALL-E Error: ${e.message}`);
        }

        await delay(DELAY_MS);
    }

    console.log("\n🎉 Gallery Updated.");
}

main();
