
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function exportGoldenEnglish() {
    console.log("=== EXPORTING GOLDEN ENGLISH DATASET (BULK MODE) ===");

    // Helper: Fetch all rows with pagination
    async function fetchAll(table, select, orderBy = 'id', filterCol = null, filterVal = null) {
        let allData = [];
        let rangeStart = 0;
        const PAGE_SIZE = 1000;

        while (true) {
            let query = supabase
                .from(table)
                .select(select)
                .range(rangeStart, rangeStart + PAGE_SIZE - 1);

            if (orderBy) query = query.order(orderBy, { ascending: true });
            if (filterCol && filterVal) query = query.eq(filterCol, filterVal);

            const { data, error } = await query;
            if (error) throw error;

            if (data.length === 0) break;

            allData = [...allData, ...data];
            rangeStart += PAGE_SIZE;
            if (data.length < PAGE_SIZE) break;
        }
        return allData;
    }

    try {
        // 1. Fetch ALL Recipes
        const recipes = await fetchAll('recipes', 'id, name, image, category', 'id');
        console.log(`> Fetched ${recipes.length} base recipes.`);

        // 2. Fetch ALL Registry Entries
        // Note: Registry doesn't have 'id' as primary key for ordering sometimes? It has 'id' (uuid).
        const registry = await fetchAll('registry_recipes', 'legacy_recipe_id, id', 'id');
        console.log(`> Fetched ${registry.length} registry entries.`);

        // Map Legacy ID -> UUID
        const idToUuid = {};
        registry.forEach(r => {
            idToUuid[r.legacy_recipe_id] = r.id;
        });

        // 3. Fetch ALL English Translations
        // Ordering by 'id' or 'recipe_id'
        const translations = await fetchAll('content_translations', 'recipe_id, title, instructions, qa_metadata', 'id', 'language_code', 'en');
        console.log(`> Fetched ${translations.length} English translations.`);

        // 4. Merge
        const goldenCollection = [];
        let foundCount = 0;
        let missingCount = 0;

        recipes.forEach(r => {
            const uuid = idToUuid[r.id];
            const tr = translations.find(t => t.recipe_id === uuid);


            if (tr) {
                foundCount++;

                // Resolve Best Description
                const marketing = tr.qa_metadata?.marketing_description || tr.qa_metadata?.seo_meta_description;
                const finalDesc = marketing || tr.description;

                goldenCollection.push({
                    id: r.id,
                    original_name: r.name,
                    english_name: tr.title,
                    category: r.category,
                    image: r.image,
                    description: finalDesc,
                    instructions: tr.instructions,
                    is_valid_export: true
                });
            } else {
                // No English translation found
                missingCount++;
                goldenCollection.push({
                    id: r.id,
                    original_name: r.name,
                    is_valid_export: false,
                    reason: 'MISSING_ENGLISH_TRANSLATION'
                });
            }
        });

        // 5. Save to File
        const outputPath = path.join(process.cwd(), 'zaffaron_golden_english.json');
        fs.writeFileSync(outputPath, JSON.stringify(goldenCollection, null, 2));

        console.log(`\n=== EXPORT COMPLETE ===`);
        console.log(`Total Recipes: ${recipes.length}`);
        console.log(`Golden Content Found: ${foundCount}`);
        console.log(`Missing Content: ${missingCount}`);
        console.log(`Saved to: ${outputPath}`);

    } catch (e) {
        console.error("Export Failed:", e);
    }
}

exportGoldenEnglish();
