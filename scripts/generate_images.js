import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Environment Setup (assuming node 20+ --env-file)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

if (!openaiApiKey) {
    console.error("❌ OPENAI_API_KEY is missing.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// Configuration
const BATCH_SIZE = 5;
const BUCKET_NAME = 'recipe-images';

async function generateImages() {
    console.log(`🚀 Starting AI Image Factory (Limit: ${BATCH_SIZE})...`);

    // 1. Fetch Recipes without images
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, ingredients, category')
        .is('image', null)
        .limit(BATCH_SIZE);

    if (error) {
        console.error("Error fetching recipes:", error);
        return;
    }

    if (!recipes || recipes.length === 0) {
        console.log("✅ No recipes missing images found!");
        return;
    }

    console.log(`Found ${recipes.length} recipes to process.`);

    for (const recipe of recipes) {
        console.log(`\n👨‍🍳 Processing: ${recipe.name} (ID: ${recipe.id})`);

        try {
            // 2. Generate Prompt
            const prompt = `Professional food photography of Persian dish "${recipe.name}", ingredients: ${recipe.ingredients ? recipe.ingredients.slice(0, 5).join(', ') : 'traditional spices'}. High resolution, 8k, top-down view, elegant plating, moody lighting, highly detailed texture, photorealistic, cinematic depth of field.`;

            console.log(`   🎨 Generating DALL-E 3 image...`);
            const aiResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                response_format: "b64_json" // Get base64 to upload directly
            });

            const imageBase64 = aiResponse.data[0].b64_json;
            if (!imageBase64) throw new Error("No image data returned.");

            // 3. Upload to Supabase Storage
            const buffer = Buffer.from(imageBase64, 'base64');
            const fileName = `ai-gen/${recipe.id}-${Date.now()}.png`;

            console.log(`   cloud Uploading to Supabase Storage (${fileName})...`);
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from(BUCKET_NAME)
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // 4. Get Public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from(BUCKET_NAME)
                .getPublicUrl(fileName);

            console.log(`   🔗 Public URL: ${publicUrl}`);

            // 5. Update Recipe Record
            const { error: updateError } = await supabase
                .from('recipes')
                .update({ image: publicUrl })
                .eq('id', recipe.id);

            if (updateError) throw updateError;

            console.log(`   ✅ Success! Image linked.`);

        } catch (err) {
            console.error(`   ❌ Failed: ${err.message}`);
            // Continue to next recipe even if one fails
        }
    }

    console.log("\n✨ Batch Complete.");
}

generateImages();
