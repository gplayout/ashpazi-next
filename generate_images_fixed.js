
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateImagesFixed() {
    console.log("🎨 Starting Fixed Image Generation...");

    // 1. Find the 17 Restored Recipes (Integers)
    // Strategy: Find newest 25 recipes, filter by those missing 'image'
    // created_at DESC

    const { data: recipes, error } = await client
        .from('recipes')
        .select('id, name, image, created_at')
        .order('id', { ascending: false })
        .limit(25);

    if (error) {
        console.error("Fetch Error:", error);
        return;
    }

    // Filter: missing image
    const targets = recipes.filter(r => !r.image || r.image.includes('placeholder'));

    console.log(`Found ${recipes.length} recent recipes.`);
    console.log(`Targets needing images: ${targets.length}`);

    for (const target of targets) {
        // Get English title for prompt if possible, else use name
        // (recipes.name might be Farsi/English? Usually English in Legacy, but restored ones?)

        let promptTitle = target.name;

        // Try to get English translation title if Name is Farsi
        // (Actually restored recipes should have English title in 'name')

        const prompt = `Professional food photography of ${promptTitle}, centered, high resolution, vibrant colors, 4k`;
        console.log(`\nGenerating for: ${promptTitle} (ID: ${target.id})...`);

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

            // Save to DB (Correct Column: 'image')
            const { error: updateError } = await client
                .from('recipes')
                .update({ image: imageUrl })
                .eq('id', target.id);

            if (updateError) console.error("   > DB Update Failed:", updateError);
            else console.log("   > Saved to DB ✅");

        } catch (e) {
            console.error("   > Generation Failed:", e.message);
        }

        // Wait 5s
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

generateImagesFixed();
