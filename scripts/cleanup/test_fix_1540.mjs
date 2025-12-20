
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
// Dynamic import
const { TranslationAgent } = await import('./src/lib/pipeline/translation-agent.js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runFix1540() {
    const RECIPE_ID = 1540;
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
        console.log(`   - Ingredients: ${legacy.ingredients?.length || 0} items`);

        // 2. Prepare Agent Input
        const agentInput = {
            recipe_id: String(RECIPE_ID),
            source_title: legacy.name,
            source_instructions: legacy.instructions, // Array of strings?
            ingredients_context: legacy.ingredients,  // Array of strings?
            targetLanguage: "en"
        };

        // Ensure arrays
        if (typeof agentInput.source_instructions === 'string') {
            agentInput.source_instructions = JSON.parse(agentInput.source_instructions);
        }
        if (typeof agentInput.ingredients_context === 'string') {
            agentInput.ingredients_context = JSON.parse(agentInput.ingredients_context);
        }

        // 3. Run Translation Agent (Gemini 3 Flash Preview)
        console.log("🧠 Sending to Gemini 3 Flash Preview (Super Schema Mode)...");
        const result = await TranslationAgent.translate(agentInput);
        console.log("✨ GENERATION SUCCESS!");
        console.log("   Title:", result.title);
        console.log("   Tags:", result.dietary_tags);

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
            // Auto-register if missing (Should exist, but safety first)
            console.log("⚠️ Registry ID missing, searching content_translations directly...");
            // Fallback logic if needed, but for now throw
            throw new Error("Registry Match Not Found");
        }

        // 6. UPSERT into content_translations
        console.log("💾 Saving to Database (UUID: " + reg.id + ")...");

        // First check if row exists
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
            // Insert new
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
        console.log("🎉 SUCCESS! Recipe 1540 is live with Super Schema.");

    } catch (e) {
        console.error("💥 FAILED:", e);
    }
}

runFix1540();
