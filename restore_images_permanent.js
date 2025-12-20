
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const fetch = require('node-fetch');

// Initialize Clients
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function restoreImagesPermanent() {
    console.log("Starting Permanent Image Restoration...");

    // 1. Identify Recipes with Expired DALL-E Links
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name')
        .ilike('image', '%oaidalle%') // Find temp links
        .order('id', { ascending: false });

    if (error) {
        console.error("Fetch Error:", error);
        return;
    }

    if (!recipes || recipes.length === 0) {
        console.log("No recipes with temporary DALL-E links found.");
        return;
    }

    console.log(`Found ${recipes.length} recipes with temporary links. Processing...`);

    for (const recipe of recipes) {
        console.log(`\nProcessing [${recipe.id}] ${recipe.name}...`);

        try {
            // A. Generate NEW Image (DALL-E 3)
            const prompt = `Professional food photography of ${recipe.name}, overhead shot, high resolution, delicious presentation, soft natural lighting.`;

            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                response_format: "b64_json" // Get Base64 to upload directly
            });

            const imageBase64 = response.data[0].b64_json;
            const buffer = Buffer.from(imageBase64, 'base64');
            const fileName = `recipe-${recipe.id}-${Date.now()}.png`;

            // B. Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('recipe-images')
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (uploadError) {
                // If bucket doesn't exist or permissions fail, fall back to just logging
                throw new Error(`Upload Failed: ${uploadError.message}`);
            }

            // C. Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from('recipe-images')
                .getPublicUrl(fileName);

            const publicUrl = publicUrlData.publicUrl;
            console.log(` -> Uploaded to: ${publicUrl}`);

            // D. Update Recipe Record
            const { error: updateError } = await supabase
                .from('recipes')
                .update({ image: publicUrl })
                .eq('id', recipe.id);

            if (updateError) throw updateError;

            console.log(` -> Database Updated!`);

        } catch (err) {
            console.error(` -> FAILED: ${err.message}`);
        }
    }

    console.log("\nRestoration Complete.");
}

restoreImagesPermanent();
