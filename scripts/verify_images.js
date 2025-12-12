
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyImages() {
    console.log("🔍 Verifying Recipe Images...");

    // 1. Check DB for NULL images
    const { count, error } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .is('image', null);

    if (error) {
        console.error("DB Error:", error);
        return;
    }

    if (count > 0) {
        console.error(`❌ Found ${count} recipes with MISSING images in DB.`);
    } else {
        console.log("✅ DB Check: All recipes have an image URL.");
    }

    // 2. Check File System for generated images
    const IMAGE_DIR = path.join(process.cwd(), 'public', 'recipe-images');
    if (fs.existsSync(IMAGE_DIR)) {
        const files = fs.readdirSync(IMAGE_DIR);
        console.log(`✅ File System Check: Found ${files.length} generated images in /public/recipe-images.`);
    } else {
        console.warn("⚠️ /public/recipe-images directory does not exist (might be using remote URLs only).");
    }
}

verifyImages();
