
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Init Clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const IMAGE_DIR = path.join(process.cwd(), 'public', 'recipe-images');
if (!fs.existsSync(IMAGE_DIR)) fs.mkdirSync(IMAGE_DIR, { recursive: true });

async function generateImages() {
    console.log("🎨 Starting AI Image Generation (DALL-E 3)...");

    // 1. Find missing images
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name_en')
        .is('image', null);

    if (error || !recipes) {
        console.error("Error fetching recipes:", error);
        return;
    }

    console.log(`Found ${recipes.length} recipes needing images.`);

    for (const recipe of recipes) {
        console.log(`🖌️ Painting: ${recipe.name_en}...`);

        try {
            // Generate
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: `Professional food photography of authentic ${recipe.name_en}, overhead shot, high resolution, delicious lighting, 4k`,
                n: 1,
                size: "1024x1024",
                response_format: "url"
            });

            const imageUrl = response.data[0].url;
            const filename = `${recipe.id}.png`;
            const localPath = path.join(IMAGE_DIR, filename);
            const publicPath = `/recipe-images/${filename}`;

            // Download & Save
            await downloadImage(imageUrl, localPath);

            // Update DB
            await supabase
                .from('recipes')
                .update({ image: publicPath })
                .eq('id', recipe.id);

            console.log(`   ✅ Saved to ${publicPath}`);

        } catch (e) {
            console.error(`   ❌ Error: ${e.message}`);
        }
    }
    console.log("🎉 All images generated!");
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve());
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
}

generateImages();
