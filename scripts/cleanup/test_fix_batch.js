require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { TranslationAgent } = require('./src/lib/pipeline/translation-agent');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runBatchTest() {
    const TARGET_IDS = [1530, 1531, 1532, 1533, 1534, 1535, 1536, 1537, 1538];
    console.log(`🚀 Starting Proof-of-Concept Batch for IDs: ${TARGET_IDS.join(', ')}`);

    for (const legacyId of TARGET_IDS) {
        console.log(`\n---------------------------------------`);
        console.log(`🔄 Processing Recipe ID: ${legacyId}`);

        try {
            // 1. Fetch Source
            const { data: recipe } = await supabase.from('recipes').select('*').eq('id', legacyId).single();
            if (!recipe) {
                console.error(`   ❌ Legacy ID ${legacyId} not found.`);
                continue;
            }

            // 2. Fetch/Create Registry ID
            let { data: reg } = await supabase.from('registry_recipes').select('id').eq('legacy_recipe_id', legacyId).single();
            if (!reg) {
                // Create if missing (edge case)
                const { data: newReg } = await supabase.from('registry_recipes').insert({ legacy_recipe_id: legacyId }).select().single();
                reg = newReg;
            }

            // 3. Translate
            console.log(`   🧠 Generating Content for "${recipe.name}"...`);
            const input = {
                recipe_id: reg.id,
                source_title: recipe.name,
                source_instructions: typeof recipe.instructions === 'string' ? JSON.parse(recipe.instructions) : recipe.instructions,
                ingredients_context: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients,
                targetLanguage: 'en'
            };

            const result = await TranslationAgent.translate(input);

            // 4. Save
            // CRITICAL FIX: Include ALL fields for the UI Boxes
            const qa_metadata = {
                // Core
                nutrition: result.nutrition,
                internal_score: result.internal_score,
                marketing_description: result.marketing_description,

                // Rich Narrative (Boxes)
                origin_history: result.origin_history,
                sensory_experience: result.sensory_experience,
                chef_guide: result.chef_guide,

                // Smart Tags & Guides (Boxes)
                ingredient_substitutions: result.ingredient_substitutions, // <--- Chef's Swaps Box
                health_benefits: result.health_benefits, // <--- Health Vnefits Box
                equipment_needed: result.equipment_needed,
                dietary_tags: result.dietary_tags,
                occasion_tags: result.occasion_tags,

                // Flavor & Pairings
                flavor_profile: result.flavor_profile,
                pairings: result.pairings,

                // Meta
                estimated_cost: result.estimated_cost,
                difficulty_level: result.difficulty_level,
                seo_keywords: result.seo_keywords,
                seo_meta_description: result.seo_meta_description,
                social_share_copy: result.social_share_copy,
                allergen_contains: result.allergen_contains,
                kid_friendly: result.kid_friendly,

                // Helper for UI "Dietary Tags" display
                tags: result.dietary_tags ? [...result.dietary_tags, ...(result.occasion_tags || [])] : []
            };

            const { error: saveErr } = await supabase
                .from('content_translations')
                .upsert({
                    recipe_id: reg.id,
                    language_code: 'en',
                    title: result.title,
                    ingredients: result.ingredients,
                    instructions: result.instructions,
                    qa_metadata: qa_metadata,
                    publish_status: 'published',
                    version: 6 // PoC Version Updated
                }, { onConflict: 'recipe_id, language_code' });

            if (saveErr) throw saveErr;

            // 5. Update Pipeline State (to avoid re-process by main script)
            await supabase
                .from('recipe_pipeline_state')
                .upsert({
                    legacy_recipe_id: legacyId,
                    status: 'published',
                    last_processed_at: new Date().toISOString()
                }, { onConflict: 'legacy_recipe_id' });

            console.log(`   ✅ Success! View at: http://localhost:3000/recipe/${legacyId}`);

        } catch (e) {
            console.error(`   💥 Failed:`, e.message);
        }
    }
    console.log(`\n🎉 Batch Test Complete.`);
}

runBatchTest();
