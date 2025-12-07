const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load env vars from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const parseEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : null;
};

const SUPABASE_URL = parseEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = parseEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
// We will ask user to set this or paste it
const SERPER_API_KEY = process.env.SERPER_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase keys in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    if (!SERPER_API_KEY) {
        console.error("❌ SERPER_API_KEY is missing. Please set it or edit the script.");
        process.exit(1);
    }

    console.log("🤖 Starting The Robot (Automated Image Sourcing)...");

    // 1. Get recipes
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name')
        .is('image', null);
    // .limit(5); // Test batch first

    if (error) {
        console.error("Error fetching recipes:", error);
        return;
    }

    console.log(`Found ${recipes.length} recipes needing images.`);

    for (const recipe of recipes) {
        await processRecipe(recipe);
        // Sleep to be safe
        await new Promise(r => setTimeout(r, 500));
    }
}

async function processRecipe(recipe) {
    const query = `Authentic Persian food ${recipe.name}`;
    console.log(`\n🔍 Searching: "${query}"...`);

    try {
        // 2. Search Serper
        const searchRes = await fetch('https://google.serper.dev/images', {
            method: 'POST',
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: query })
        });

        const searchData = await searchRes.json();
        if (!searchData.images || searchData.images.length === 0) {
            console.log("   ⚠️ No results found.");
            return;
        }

        const firstImage = searchData.images[0];
        const imageUrl = firstImage.imageUrl;
        console.log(`   found: ${imageUrl.slice(0, 50)}...`);

        // 3. Download & Upload
        const storedUrl = await uploadImage(imageUrl, recipe.id);
        if (storedUrl) {
            // 4. Update DB
            await supabase.from('recipes').update({ image: storedUrl }).eq('id', recipe.id);
            console.log(`   ✅ Saved!`);
        }

    } catch (e) {
        console.error(`   ❌ Failed: ${e.message}`);
    }
}

async function uploadImage(url, recipeId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const ext = contentType.split('/')[1] || 'jpg';
        const fileName = `curated/robot-${recipeId}-${Date.now()}.${ext}`;

        const { error } = await supabase.storage.from('recipe-images').upload(fileName, buffer, {
            contentType,
            upsert: true
        });

        if (error) throw error;

        const { data } = supabase.storage.from('recipe-images').getPublicUrl(fileName);
        return data.publicUrl;

    } catch (e) {
        console.error(`   Upload error: ${e.message}`);
        return null; // Skip this one
    }
}

run();
