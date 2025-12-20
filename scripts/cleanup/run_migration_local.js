const { createClient } = require('@supabase/supabase-js');
const { TranslationAgent } = require('./src/lib/pipeline/translation-agent');
require('dotenv').config({ path: '.env.local' });

// Config
const BATCH_SIZE = 5;
const DELAY_MS = 1000;
const LANG = 'en';

// Init
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runLocalMigration() {
    console.log(`🚀 STARTING LOCAL MIGRATION (Direct Mode)`);
    console.log(`   Model: gemini-2.0-flash-exp !!!`);

    let processed = 0;
    let errors = 0;

    while (true) {
        // 1. Fetch Candidates (Recipes that are normalized but NOT translated in EN)
        // We'll use a simple approach: Get a chunk of normalized recipes, check if they exist in translations

        // Fetch raw recipes that are "normalized" (ready for Chef Zaffaron)
        // We rely on the view or table 'recipe_pipeline_state' if available, or just join manually.
        // For robustness in this script, let's fetch 'registry_recipes' which holds the mapping.

        // Fetch a batch of normalized IDs
        const { data: registryItems, error: regErr } = await supabase
            .from('recipe_pipeline_state')
            .select('legacy_recipe_id, status')
            .eq('status', 'normalized_ok') // Adjust this status if your pipeline uses a different one for "ready"
            .limit(100); // larger fetch to filter in memory

        if (regErr) {
            console.error("DB Error:", regErr.message);
            await sleep(5000);
            continue;
        }

        if (!registryItems || registryItems.length === 0) {
            console.log("No normalized recipes found waiting...");
            // Might need to check 'manual_retry' or others, but for now assuming normalized_ok
            await sleep(10000); // wait longer
            continue;
        }

        let batchWorkDone = false;

        for (const item of registryItems) {
            if (processed % 20 === 0 && processed > 0) console.log(`   ... processed ${processed} so far ...`);

            const legacyId = item.legacy_recipe_id;

            // Resolve UUID
            const { data: uuidData } = await supabase.from('registry_recipes').select('id').eq('legacy_recipe_id', legacyId).single();
            if (!uuidData) continue;
            const recipeUUID = uuidData.id;

            // Check if done
            const { data: existing } = await supabase.from('content_translations').select('id').eq('recipe_id', recipeUUID).eq('language_code', LANG).single();
            if (existing) continue; // Already done

            // NOT DONE! Let's do it.
            try {
                // Fetch Source
                const { data: source } = await supabase.from('recipes').select('name, instructions').eq('id', legacyId).single();

                // Fetch Context
                const { data: ings } = await supabase.from('recipe_ingredients').select('raw_note_fa').eq('recipe_id', recipeUUID);
                const context = ings ? ings.map(i => i.raw_note_fa).filter(Boolean) : [];

                const input = {
                    recipe_id: recipeUUID,
                    source_title: source.name,
                    source_instructions: Array.isArray(source.instructions) ? source.instructions : [source.instructions],
                    ingredients_context: context,
                    targetLanguage: LANG
                };

                console.log(`   COOKING: ${source.name.substring(0, 30)}...`);
                const result = await TranslationAgent.translate(input);

                // Save
                await supabase.from('content_translations').upsert({
                    recipe_id: recipeUUID,
                    language_code: LANG,
                    title: result.title,
                    instructions: result.instructions,
                    ingredients: result.ingredients || [],
                    qa_metadata: {
                        internal_score: result.internal_score,
                        marketing_description: result.marketing_description,
                        nutrition: result.nutrition,
                        model: 'gemini-2.0-flash-exp' // Telemetry
                    },
                    publish_status: 'published',
                    last_updated: new Date().toISOString()
                });

                console.log(`   ✅ SERVED! Score: ${result.internal_score?.marketing_joy_score}`);
                processed++;
                batchWorkDone = true;

                // Mark pipeline state (optional, or just rely on content_translations existence)
                await supabase.from('recipe_pipeline_state').update({ status: 'translated_en' }).eq('legacy_recipe_id', legacyId);

                await sleep(500); // Rate limit

            } catch (e) {
                console.error(`   ❌ BURNT: ${e.message}`);
                errors++;
            }
        }

        if (!batchWorkDone) {
            console.log("   (Batch scanned but all were done/skipped. Checking next page...)");
            // To avoid infinite loop on same 100 items, we need a better fetch strategy or just assume 
            // we rely on 'status' update to 'translated_en'. 
            // If status update failed, we loop. 
            // Optimization: In real run, we'd use 'offset' or filter by 'status' != 'translated_en'.
            // But 'recipe_pipeline_state' update above should fix it.
            await sleep(2000);
        }
    }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

runLocalMigration();
