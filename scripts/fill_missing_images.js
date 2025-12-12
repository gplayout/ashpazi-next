
const { createClient } = require('@supabase/supabase-js');
const { search, SafeSearchType } = require('duck-duck-scrape');
require('dotenv').config({ path: '.env.local' });

const DELAY_MS = 5000; // Slow down to avoid rate limits

// Init Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
    console.log("🔍 Scanning for recipes without images...");

    // 1. Fetch missing images
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name_en, category')
        .or('image.is.null,image.eq.""');

    if (error) {
        console.error("DB Error:", error.message);
        return;
    }

    if (!recipes || recipes.length === 0) {
        console.log("✅ All recipes have images!");
        return;
    }

    console.log(`📋 Found ${recipes.length} recipes missing images. Starting backfill...`);

    for (const recipe of recipes) {
        console.log(`\n🖼️ Finding image for: ${recipe.name_en} (${recipe.category})...`);

        try {
            const query = `${recipe.name_en} authentic food photography ${recipe.category}`;
            const results = await search(query, {
                safeSearch: SafeSearchType.MODERATE
            });

            if (results.images && results.images.length > 0) {
                const newImage = results.images[0].url;

                // Update DB
                const { error: updateError } = await supabase
                    .from('recipes')
                    .update({ image: newImage })
                    .eq('id', recipe.id);

                if (updateError) {
                    console.error(`   ❌ Failed to update DB: ${updateError.message}`);
                } else {
                    console.log(`   ✅ Updated!`);
                }
            } else {
                console.warn(`   ⚠️ No images found on DDG.`);
            }

        } catch (e) {
            console.error(`   ❌ Search Error: ${e.message}`);
        }

        // Wait to be polite
        await delay(DELAY_MS);
    }

    console.log("\n🎉 Backfill Complete.");
}

main();
