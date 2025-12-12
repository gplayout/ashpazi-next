
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log("💾 Starting Image Persistence Migration...");

    // 1. Find Temporary URLs
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name_en, image')
        .ilike('image', '%blob.core.windows.net%'); // Filter for Azure/OpenAI URLs

    if (error) {
        console.error("DB Error:", error.message);
        return;
    }

    if (!recipes || recipes.length === 0) {
        console.log("✅ No temporary images found.");
        return;
    }

    console.log(`📋 Found ${recipes.length} volatile images. Moving to permanent storage...`);

    for (const recipe of recipes) {
        console.log(`\n📦 Migrating: ${recipe.name_en}...`);

        try {
            // A. Download
            const response = await fetch(recipe.image);
            if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
            const buffer = await response.arrayBuffer();

            // B. Upload to Supabase Storage
            // Sanitize filename: ASCII only
            const safeName = recipe.name_en.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `public/${Date.now()}_${safeName}.png`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('recipe-images') // Ensure this bucket exists!
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // C. Get Public URL
            const { data: publicUrlData } = supabase
                .storage
                .from('recipe-images')
                .getPublicUrl(fileName);

            const permanentUrl = publicUrlData.publicUrl;

            // D. Update DB
            const { error: dbError } = await supabase
                .from('recipes')
                .update({ image: permanentUrl })
                .eq('id', recipe.id);

            if (dbError) throw dbError;

            console.log(`   ✅ Secured: ${permanentUrl}`);

        } catch (e) {
            console.error(`   ❌ Failed: ${e.message}`);
        }
    }

    console.log("\n🔒 All images secured.");
}

main();
