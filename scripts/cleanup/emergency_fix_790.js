
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Setup Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix790() {
    try {
        console.log("🚑 EMERGENCY FIX FOR RECIPE 790 (Attempt 4 - The Mapper Fix)...");

        // Dynamic Import
        const { TranslationAgent } = await import('./src/lib/pipeline/translation-agent.js');

        // 1. Get Registry
        const { data: reg, error: regError } = await supabase.from('registry_recipes').select('id, legacy_recipe_id').eq('legacy_recipe_id', 790).single();
        if (regError || !reg) { console.error("No registry found:", regError); return; }

        // 2. Fetch Legacy Data
        const { data: legacy, error: legError } = await supabase.from('recipes').select('*').eq('id', 790).single();
        if (legError || !legacy) { console.error("No legacy found:", legError); return; }

        // 3. WIPE OLD TRANSLATION
        console.log("🗑️ Deleting old translation...");
        await supabase.from('content_translations').delete().eq('recipe_id', reg.id).eq('language_code', 'en');

        // 4. GENERATE NEW (Super Schema)
        console.log("✨ Generating NEW Golden Content (Gemini 3-Flash)...");

        const input = {
            recipe_id: legacy.id,
            source_title: legacy.name_en || legacy.name,
            source_instructions: legacy.instructions || [],
            ingredients_context: legacy.ingredients || [],
            targetLanguage: 'en'
        };

        const result = await TranslationAgent.translate(input);

        // 5. MAP FLAT RESULT TO NESTED QA_METADATA (CRITICAL FIX)
        const qa_metadata = {
            origin_history: result.origin_history,
            why_this_version: result.why_this_version,
            sensory_experience: result.sensory_experience,
            chef_guide: result.chef_guide,
            dietary_tags: result.dietary_tags,
            occasion_tags: result.occasion_tags,
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
            nutrition: result.nutrition,
            internal_score: result.internal_score,
            marketing_description: result.marketing_description
        };

        // 6. SAVE
        console.log("💾 Saving to DB with FULL METADATA...", result.title);
        const { error: saveError } = await supabase.from('content_translations').insert({
            recipe_id: reg.id,
            language_code: 'en',
            title: result.title,
            ingredients: result.ingredients,
            instructions: result.instructions,
            qa_metadata: qa_metadata, // Correctly constructed!
            publish_status: 'published'
        });

        if (saveError) console.error("Save Error:", saveError);
        else console.log("✅ FIXED! Recipe 790 is now TRULY Royal.");

    } catch (e) {
        console.error("FATAL SCRIPT ERROR:", e);
    }
}

fix790();
