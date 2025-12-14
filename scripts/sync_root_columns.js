
const { createClient } = require('@supabase/supabase-js');
const { generateSlug } = require('../src/utils/slugUtils'); // Assuming this exists or I'll implement a simple one
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

function slugify(text) {
    if (!text) return null;
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '') // remove non-word chars
        .replace(/\s+/g, '-')     // replace spaces with hyphens
        .replace(/--+/g, '-')     // collapse hyphens
        .trim();
}

async function syncColumns() {
    console.log("🔄 SYNCING JSON DATA TO ROOT COLUMNS...");

    // Process in batches of 50
    let rangeStart = 0;
    const batchSize = 50;

    while (true) {
        const { data: recipes, error } = await supabase
            .from('recipes')
            .select('*')
            .range(rangeStart, rangeStart + batchSize - 1)
            .order('id', { ascending: false });

        if (error) {
            console.error("❌ DB Error:", error);
            break;
        }
        if (!recipes || recipes.length === 0) break;

        console.log(`Processing batch ${rangeStart} - ${rangeStart + recipes.length}...`);

        for (const r of recipes) {
            if (!r.nutrition_info) continue;

            const ni = r.nutrition_info;
            const updates = {};
            let hasUpdate = false;

            // 1. Sync English Name (from 'en')
            let newNameEn = ni.en?.name || ni.english?.name || ni.name_en;
            let newNameFa = ni.fa?.name || ni.persian?.name || ni.header?.title;
            let newDescEn = ni.en?.description || ni.english?.description || ni.description;
            // Note: DB 'name' is often Farsi in this legacy DB, but 'name_en' is English.
            // But sometimes 'name' is English if legacy. We want 'name' to be Farsi if possible, or fallback.

            // Logic: If 'en.name' exists, update root 'name_en'
            if (newNameEn && newNameEn !== r.name_en) {
                updates.name_en = newNameEn;
                hasUpdate = true;
            }

            // Logic: Sync Slug from English Name
            if (updates.name_en) {
                const newSlug = slugify(updates.name_en);
                if (newSlug && newSlug !== r.slug) {
                    updates.slug = newSlug;
                    hasUpdate = true;
                }
            } else if (r.name_en && !r.slug) {
                const newSlug = slugify(r.name_en);
                if (newSlug) {
                    updates.slug = newSlug;
                    hasUpdate = true;
                }
            }

            // Logic: Sync Description (FORCE overwrite with English Narrative)
            if (newDescEn && newDescEn.length > 20) {
                // We want to FORCE the English narrative into the main description for now
                // because the user wants to see the "Rich Text" which is currently in English.
                if (newDescEn !== r.description) {
                    updates.description = newDescEn;
                    hasUpdate = true;
                }
            }

            // Logic: Sync 'Category'
            const cat = ni.en?.categories?.[0] || ni.english?.categories?.[0] || ni.category;
            if (cat && cat !== r.category) {
                updates.category = cat;
                hasUpdate = true;
            }

            if (hasUpdate) {
                // console.log(`   -> Updating ID ${r.id}: ${JSON.stringify(updates)}`);
                const { error: updateError } = await supabase
                    .from('recipes')
                    .update(updates)
                    .eq('id', r.id);

                if (updateError) console.error(`   ❌ Failed to update ID ${r.id}:`, updateError.message);
            }
        }

        rangeStart += batchSize;
        // sleep slightly to be nice to DB
        await new Promise(r => setTimeout(r, 100));
    }

    console.log("✅ SYNC COMPLETE");
}

syncColumns();
