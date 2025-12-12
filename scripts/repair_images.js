
const { createClient } = require('@supabase/supabase-js');
const { search, SafeSearchType } = require('duck-duck-scrape');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function repairImages() {
    console.log("🚑 Starting Image Repair...");

    // 1. Find recipes with no image
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name_en')
        .is('image', null);

    if (error) {
        console.error("Error fetching recipes:", error);
        return;
    }

    console.log(`found ${recipes.length} recipes without images.`);

    for (const recipe of recipes) {
        console.log(`📷 Fixing: ${recipe.name_en}...`);

        try {
            const query = `${recipe.name_en} food photography high quality`;
            const results = await search(query, {
                safeSearch: SafeSearchType.MODERATE
            });

            if (results.images && results.images.length > 0) {
                const imageUrl = results.images[0].url;

                await supabase
                    .from('recipes')
                    .update({ image: imageUrl })
                    .eq('id', recipe.id);

                console.log(`   ✅ Restored Image.`);
            } else {
                console.log(`   ⚠️ No image found.`);
            }
        } catch (e) {
            console.error(`   ❌ Failed: ${e.message}`);
        }

        // Rate limit (Increased to avoid DDG Ban)
        await new Promise(r => setTimeout(r, 6000));
    }
    console.log("🎉 Repair Complete!");
}

repairImages();
