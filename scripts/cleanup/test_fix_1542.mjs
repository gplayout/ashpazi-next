
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
// Dynamic import
const { TranslationAgent } = await import('./src/lib/pipeline/translation-agent.js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runFix1542() {
    const RECIPE_ID = 1542;
    console.log(`🚀 Starting High-Fidelity Process for Recipe ${RECIPE_ID}...`);

    try {
        // 1. Fetch Legacy Data
        const { data: legacy, error: legacyError } = await supabase
            .from('recipes')
            .select('*')
            .eq('id', RECIPE_ID)
            .single();

        if (legacyError || !legacy) throw new Error(`Legacy Recipe ${RECIPE_ID} not found: ${legacyError?.message}`);

        console.log(`✅ Fetched Legacy: "${legacy.name}"`);

        // 2. Prepare Agent Input
        const agentInput = {
            recipe_id: String(RECIPE_ID),
            source_title: legacy.name,
            source_instructions: typeof legacy.instructions === 'string' ? JSON.parse(legacy.instructions) : legacy.instructions,
            ingredients_context: typeof legacy.ingredients === 'string' ? JSON.parse(legacy.ingredients) : legacy.ingredients,
            targetLanguage: "en"
        };

        // 3. Run Translation Agent (Gemini 3 Flash Preview)
        console.log("🧠 Sending to Gemini 3 Flash Preview (Magnetizing Story Mode)...");
        const result = await TranslationAgent.translate(agentInput);
        console.log("✨ GENERATION SUCCESS!");
        console.log("   Title:", result.title);
        console.log("   Story Snippet:", result.origin_history?.substring(0, 100) + "...");
        console.log("   Sensory:", result.sensory_experience);

        // 4. Prepare QA Metadata
        const qa_metadata = {
            ...result.internal_score,
            marketing_description: result.marketing_description,
            origin_history: result.origin_history,
            why_this_version: result.why_this_version,
            sensory_experience: result.sensory_experience,
            chef_guide: result.chef_guide,
            nutrition: result.nutrition,

            // Ruthless Data Fields
            dietary_tags: result.dietary_tags,
            occasion_tags: result.occasion_tags,
            seasonality: result.seasonality,
            difficulty_level: result.difficulty_level,
            ingredient_substitutions: result.ingredient_substitutions,
            equipment_needed: result.equipment_needed,
            flavor_profile: result.flavor_profile,
            pairings: result.pairings,
            estimated_cost: result.estimated_cost,
            seo_keywords: result.seo_keywords,
            seo_meta_description: result.seo_meta_description,
            social_share_copy: result.social_share_copy,
            allergen_contains: result.allergen_contains,
            kid_friendly: result.kid_friendly,
            tags: result.dietary_tags ? [...result.dietary_tags, ...(result.occasion_tags || [])] : []
        };

        // 5. Get Registry UUID
        const { data: reg, error: regError } = await supabase
            .from('registry_recipes')
            .select('id')
            .eq('legacy_recipe_id', RECIPE_ID)
            .single();

        if (regError || !reg) {
            throw new Error("Registry Match Not Found");
        }

        // 6. UPSERT into content_translations
        console.log("💾 Saving to Database (UUID: " + reg.id + ")...");

        const { data: existing } = await supabase
            .from('content_translations')
            .select('*')
            .eq('recipe_id', reg.id)
            .eq('language_code', 'en')
            .single();

        let saveError;
        if (existing) {
            const { error } = await supabase
                .from('content_translations')
                .update({
                    title: result.title,
                    ingredients: result.ingredients,
                    instructions: result.instructions,
                    qa_metadata: qa_metadata,
                    publish_status: 'published'
                })
                .eq('recipe_id', reg.id)
                .eq('language_code', 'en');
            saveError = error;
        } else {
            const { error } = await supabase
                .from('content_translations')
                .insert({
                    recipe_id: reg.id,
                    language_code: 'en',
                    title: result.title,
                    ingredients: result.ingredients,
                    instructions: result.instructions,
                    qa_metadata: qa_metadata,
                    publish_status: 'published'
                });
            saveError = error;
        }

        if (saveError) throw saveError;
        console.log("🎉 SUCCESS! Recipe 1542 is live.");

    } catch (e) {
        console.error("💥 FAILED:", e);
    }
}

runFix1542();
