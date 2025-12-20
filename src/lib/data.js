import { supabase } from './supabase';



// Helper to find recipe by slug (Server Side)
// Helper to find recipe by slug (Server Side)
export async function getRecipeBySlug(slug) {
    if (!slug) return null;

    // Use Service Role if available to bypass RLS on registry_recipes
    // This is safe because this function runs on the server (page.js)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const client = serviceKey
        ? (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceKey
        )
        : supabase;

    try {
        const decoded = decodeURIComponent(slug);
        const normalized = decoded.replace(/-/g, ' ');
        console.log(`[getRecipeBySlug] Lookup Slug: "${slug}"`);
        if (serviceKey) console.log(`[getRecipeBySlug] Using Service Role Client`);

        // Tier 0: Featured Aliases
        const FEATURED_ALIASES = {
            'ghormeh-sabzi': 1111,
            'fesenjan': 1059,
            'kebab-koobideh': 866,
            'tahchin': 1029,
            'zereshk-polo': 1032,
            'white-pizza': 932
        };

        // Helper to check for content upgrade (Shared logic)
        const checkForUpgrade = async (legacyRecipe) => {
            // Attempt Upgrade
            try {
                // HARDENING: Fetch ALL translations, not just EN.
                // We need to populate nutrition_info.de/fr so the client can switch languages.
                const { data: upgrade } = await client
                    .from('registry_recipes')
                    .select('content_translations(title, instructions, ingredients, qa_metadata, language_code, publish_status)')
                    .eq('legacy_recipe_id', legacyRecipe.id)
                    // .eq('content_translations.language_code', 'en') // REMOVED CONSTRAINT
                    .maybeSingle();

                // Check deeply nested array from join
                const translations = upgrade?.content_translations;

                if (translations && Array.isArray(translations) && translations.length > 0) {
                    // console.log(`[getRecipeBySlug] Found ${translations.length} translations for ${legacyRecipe.id}`);

                    let mergedRecipe = { ...legacyRecipe };
                    let enTrans = null;

                    // 1. First Pass: Populate nutrition_info for ALL languages
                    translations.forEach(trans => {
                        if (trans.publish_status !== 'published') return;
                        mergedRecipe = mergeTranslation(mergedRecipe, trans, false); // false = Don't overwrite top-level yet
                        if (trans.language_code === 'en') enTrans = trans;
                    });

                    // 2. Second Pass: If EN exists, set it as top-level default (Golden Path)
                    if (enTrans) {
                        mergedRecipe = mergeTranslation(mergedRecipe, enTrans, true);
                    }

                    return mergedRecipe;
                }
            } catch (err) {
                console.warn("[getRecipeBySlug] Upgrade check failed (non-critical):", err);
            }
            return legacyRecipe;
        };

        if (FEATURED_ALIASES[slug]) {
            const { data } = await client.from('recipes').select('*, recipe_translations(*)').eq('id', FEATURED_ALIASES[slug]).maybeSingle();
            if (data) {
                // FIX: Check for upgrade even for Tier 0
                return await checkForUpgrade(data);
            }
        }

        // Tier 1: ID Lookup
        if (/^\d+$/.test(slug)) {
            const { data: legacy } = await client.from('recipes').select('*, recipe_translations(*)').eq('id', slug).maybeSingle();
            if (legacy) {
                // Check for Golden Translation Upgrade
                console.log(`[getRecipeBySlug] Checking upgrade for ID: ${slug}`);
                return await checkForUpgrade(legacy);
                return legacy;
            }
        }

        // Monitor for UUID format (Bridge ID or Translation ID)
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
            console.log(`[getRecipeBySlug] Checking UUID: ${slug}`);

            // A. Check Registry (Bridge ID)
            const { data: bridge } = await client
                .from('registry_recipes')
                .select('legacy_recipe_id')
                .eq('id', slug)
                .maybeSingle();

            if (bridge) {
                console.log(`[getRecipeBySlug] Found Bridge ID -> Legacy: ${bridge.legacy_recipe_id}`);
                const { data: legacy } = await client.from('recipes').select('*, recipe_translations(*)').eq('id', bridge.legacy_recipe_id).single();
                if (legacy) return await checkForUpgrade(legacy);
            }

            // B. Check Content Translation ID directly
            const { data: trans } = await client
                .from('content_translations')
                .select('recipe_id, registry_recipes(legacy_recipe_id)') // Corrected: Check recipe_id (UUID)
                .eq('recipe_id', slug) // Assuming slug passed IS the recipe_id (which for content_translations is the Registry ID usually)
                // Wait, typically content_translations.recipe_id points to registry_recipes.id
                .limit(1)
                .maybeSingle();

            // Re-evaluating: The ID passed in the URL (e.g. 616b36cb...) IS the recipe_id in content_translations
            // which maps to registry_recipes.id. 
            // So if A didn't find it (because maybe registry ID is different?), let's trust content_translations.

            // Actually, for the German ones, the ID I found (616b36cb...) was in the `recipe_id` column of `content_translations`.
            // So logic A should have caught it IF checking `registry_recipes`.
            // But wait, `content_translations.recipe_id` IS a FK to `registry_recipes.id`.
            // So logic A is sufficient IF the slug is indeed the `registry_recipes.id`.

            // Let's safe guard:
            // If the slug is the *Translation Row ID* (id column of content_translations), we should handle that too?
            // The query user saw was: ID: 616b36cb... which was recipe_id from content_translations.
            // So logic A MUST work.
            // UNLESS... the row exists in content_translations but NOT in registry_recipes? (Which would be a FK violation, unlikely).
            // OR... RLS is blocking access to registry_recipes? (We are using service role if avail, otherwise public).

            // Let's add a robust check for "Translation ID" just in case user pasted the translation's own PK ID.
            const { data: transPK } = await client
                .from('content_translations')
                .select('recipe_id')
                .eq('id', slug)
                .maybeSingle();

            if (transPK) {
                console.log(`[getRecipeBySlug] Input was Translation PK. Redirecting to Registry ID: ${transPK.recipe_id}`);
                const { data: legacy } = await client
                    .from('registry_recipes')
                    .select('legacy_recipe_id')
                    .eq('id', transPK.recipe_id)
                    .single();
                if (legacy) {
                    const { data: r } = await client.from('recipes').select('*, recipe_translations(*)').eq('id', legacy.legacy_recipe_id).single();
                    if (r) return await checkForUpgrade(r);
                }
            }

        }

        // Tier 2: Published Translation (Title Match)
        const { data: trans } = await client
            .from('content_translations')
            .select(`
                title, instructions, ingredients, qa_metadata, language_code, 
                registry_recipes!inner(legacy_recipe_id)
            `)
            .eq('publish_status', 'published')
            .or(`title.ilike.${normalized},title.eq.${normalized}`)
            .limit(1)
            .maybeSingle();

        if (trans && trans.registry_recipes?.legacy_recipe_id) {
            const { data: legacy } = await supabase.from('recipes').select('*').eq('id', trans.registry_recipes.legacy_recipe_id).single();
            if (legacy) return mergeTranslation(legacy, trans);
        }

        // Tier 3: Legacy Fallback + Hydration
        // Convert slug-style (dashes) to Name style (wildcards) for flexible lookup
        // e.g. "Classic-Chinese-Style" -> "Classic%Chinese%Style" matches "Classic Chinese-Style"
        const nameQuery = slug.split('-').join('%');
        console.log(`[getRecipeBySlug] Tier 3 Query: "${nameQuery}"`);

        const { data: legacyRecipe, error } = await client
            .from('recipes')
            .select(`
                *,
                recipe_translations(
                    language,
                    title,
                    description,
                    ingredients,
                    instructions
                )
            `)
            .ilike('name_en', nameQuery) // Use ilike for case-insensitive matching on Name
            .maybeSingle(); // Changed to maybeSingle to handle no results gracefully

        if (legacyRecipe) {
            console.log(`[getRecipeBySlug] Found Legacy: ${legacyRecipe.id}`);
            return await checkForUpgrade(legacyRecipe);
        }

        return null; // 404

    } catch (error) {
        console.error(`[getRecipeBySlug] CRITICAL ERROR for "${slug}":`, error);
        return null; // Return null to trigger 404 instead of 500 crash
    }
}

// Helper to merge translation data into legacy object
function mergeTranslation(legacy, trans, overwriteTopLevel = true) {
    const langCode = trans.language_code || 'en';

    // Construct the nutrition info object for this language
    // This matches what useNutrition hook expects: recipe.nutrition_info[lang]
    const enrichedData = {
        name: trans.title,
        ingredients: trans.ingredients,
        instructions: trans.instructions,
        description: trans.qa_metadata?.marketing_description || legacy.description,
        nutrition: trans.qa_metadata?.nutrition || {},

        // Rich Content (Gemini 3.0)
        origin_history: trans.qa_metadata?.origin_history,
        why_this_version: trans.qa_metadata?.why_this_version,
        sensory_experience: trans.qa_metadata?.sensory_experience,
        chef_guide: trans.qa_metadata?.chef_guide,
        internal_score: trans.qa_metadata?.internal_score, // Internal Zaffaron Score

        // NEW: Super Schema Data (SEO, Tags, Usage)
        tags: [
            ...(trans.qa_metadata?.dietary_tags || []),
            ...(trans.qa_metadata?.occasion_tags || []),
            ...(trans.qa_metadata?.seasonality || [])
        ],
        dietary_tags: trans.qa_metadata?.dietary_tags,
        difficulty_level: trans.qa_metadata?.difficulty_level,
        estimated_cost: trans.qa_metadata?.estimated_cost,
        seo: {
            keywords: trans.qa_metadata?.seo_keywords,
            description: trans.qa_metadata?.seo_meta_description,
            social_share: trans.qa_metadata?.social_share_copy
        },
        usage: {
            substitutions: trans.qa_metadata?.ingredient_substitutions,
            equipment: trans.qa_metadata?.equipment_needed,
            pairings: trans.qa_metadata?.pairings
        },
        flavor_profile: trans.qa_metadata?.flavor_profile,
        pairings: trans.qa_metadata?.pairings, // Explicit

        // Legacy/Fallback Chef Notes
        chef_notes: trans.qa_metadata?.marketing_description
            ? `${trans.qa_metadata.marketing_description}\n\n${trans.qa_metadata.internal_score?.reasoning || ''}`
            : null
    };

    const base = {
        ...legacy,
        nutrition_info: {
            ...(legacy.nutrition_info || {}),
            [langCode]: enrichedData
        }
    };

    // If we want to upgrade the "Default Face" of the recipe (usually EN)
    if (overwriteTopLevel) {
        return {
            ...base,
            name: trans.title,
            name_en: trans.title,
            instructions: trans.instructions,
            ingredients: trans.ingredients,
            // FIX: Hydrate top-level integers from Metadata if available
            prep_time_minutes: enrichedData.times?.prep || base.prep_time_minutes,
            cook_time_minutes: enrichedData.times?.cook || base.cook_time_minutes,
            difficulty: enrichedData.difficulty_level || base.difficulty,

            output_language: langCode, // Track which lang owns the top level
            // Pass rich content at top level too for easier access if needed
            origin_history: trans.qa_metadata?.origin_history,
            chef_guide: trans.qa_metadata?.chef_guide,
            _is_translation: true,
            _lang: langCode
        };
    }

    return base;
}
