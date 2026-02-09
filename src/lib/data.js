import { supabase } from './supabase';

/**
 * Phase 2.5 Data Fetcher
 * Strategy: Compiled View -> Hard Spine Fallback
 */
export async function getRecipeBySlug(slug, lang = 'en') {
    if (!slug) return null;

    // Use Service Role if available (Server-side)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const client = serviceKey
        ? (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceKey
        )
        : supabase;

    console.log(`[DataLayer] Lookup: ${slug} (${lang})`);

    try {
        // 1. Resolve UUID
        let uuid = slug;
        let legacyId = null;

        // If numeric, it's a legacy ID. Resolve to UUID.
        if (/^\d+$/.test(slug)) {
            const { data } = await client.from('registry_recipes').select('id').eq('legacy_recipe_id', slug).single();
            if (data) {
                uuid = data.id;
                legacyId = slug;
            } else {
                console.warn(`[DataLayer] Legacy ID not found in Registry: ${slug}`);
                return null;
            }
        } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
            console.warn(`[DataLayer] Invalid Slug Format (Not UUID/Int): ${slug}`);
            return null;
        }

        // 2. Tier 1: Fetch Compiled View
        const { data: compiled } = await client
            .from('content_translations_compiled')
            .select('compiled_json')
            .eq('recipe_id', uuid)
            .eq('language_code', lang)
            .maybeSingle();

        if (compiled) {
            console.log(`[DataLayer] Hit Compiled View for ${uuid} (${lang})`);
            return normalizeCompiled(compiled.compiled_json, uuid, lang);
        }

        // 3. Tier 2: Raw Translation Fallback (If Compiled Misses)
        // If lang is NOT English, try to fetch raw translation explicitly.
        if (lang !== 'en') {
            console.log(`[DataLayer] Tier 2: Attempting Raw Translation Fetch for ${uuid} (${lang})`);

            const { data: rawTrans } = await client
                .from('content_translations')
                .select('*')
                .eq('recipe_id', uuid)
                .eq('language_code', lang)
                .maybeSingle();

            if (rawTrans) {
                console.log(`[DataLayer] Hit Raw Translation for ${uuid} (${lang})`);

                // We need the Spine for ingredients/structure anyway, so we fetch spine + overlay translation
                const { data: spineBase, error: spineErr } = await client
                    .from('registry_recipes')
                    .select(`
                        id,
                        legacy_recipe_id,
                        recipe_metadata ( * ),
                        recipe_ingredients ( * ),
                        recipe_steps ( * )
                    `)
                    .eq('id', uuid)
                    .order('step_index', { foreignTable: 'recipe_steps', ascending: true })
                    .single();

                if (!spineErr && spineBase) {
                    // Normalize Raw JSON to UI Props
                    const content = rawTrans; // Flattened Table

                    if (content) {
                        // STRICT NO ENGLISH BLEED
                        // 1. Ingredients: Do NOT backfill from Spine (EN)
                        // Content is likely { uuid: { label: "" } }
                        const ings = content.ingredients
                            ? Object.values(content.ingredients).map(i => i.label || i.text)
                            : [];

                        // 2. Instructions: Do NOT backfill from Spine (EN)
                        // Column is 'instructions' usually holding step map
                        const steps = content.instructions
                            ? Object.values(content.instructions)
                            : (content.steps ? Object.values(content.steps) : []);

                        // Log Partial Data
                        if (ings.length === 0 || steps.length === 0) {
                            try { const fs = require('fs'); if (!fs.existsSync('logs')) fs.mkdirSync('logs'); fs.appendFileSync('logs/data_gaps.log', `[${new Date().toISOString()}] PARTIAL_TRANS|${uuid}|${lang}|Ings:${ings.length}|Steps:${steps.length}\n`); } catch (e) { }
                            console.warn(`[DataLayer] Partial Translation for ${uuid} (${lang}). Rendering empty sections to prevent bleed.`);
                        }

                        const nutritionInfoRaw = {
                            [lang]: {
                                name: content.title || "",
                                description: content.description || "",
                                ingredients: ings,
                                instructions: steps,
                                times: {
                                    prep: spineBase.recipe_metadata?.[0]?.prep_time_minutes || 0,
                                    cook: spineBase.recipe_metadata?.[0]?.cook_time_minutes || 0
                                },
                                difficulty_level: spineBase.recipe_metadata?.[0]?.difficulty || 'Medium',
                                category: spineBase.recipe_metadata?.[0]?.category || 'Global',
                                nutrition: { calories: 0, protein: "0g", carbs: "0g", fat: "0g" }
                            }
                        };

                        return {
                            id: spineBase.id,
                            legacy_id: spineBase.legacy_recipe_id,
                            name: title || "", // No fallback to EN title
                            description: desc || "",
                            instructions: steps,
                            ingredients: ings,
                            prep_time_minutes: spineBase.recipe_metadata?.[0]?.prep_time_minutes,
                            cook_time_minutes: spineBase.recipe_metadata?.[0]?.cook_time_minutes,
                            difficulty: spineBase.recipe_metadata?.[0]?.difficulty,
                            nutrition_info: nutritionInfoRaw,

                            image: `/recipe-images/${uuid}.jpg`,
                            _lang: lang,
                            _source: 'raw_translation_fallback'
                        };
                    }
                }
            }
        }

        // 4. Tier 3: Hard Spine Fallback (Live EN)
        console.log(`[DataLayer] Fallback to Hard Spine for ${uuid}`);

        const { data: spine, error } = await client
            .from('registry_recipes')
            .select(`
                id,
                legacy_recipe_id,
                recipe_metadata ( * ),
                content_translations ( * ),
                recipe_ingredients ( * ),
                recipe_steps ( * )
            `)
            .eq('id', uuid)
            .order('step_index', { foreignTable: 'recipe_steps', ascending: true })
            .single();

        if (error || !spine) {
            console.error(`[DataLayer] Hard Spine Fetch Fail:`, error);
            return null;
        }

        // DEBUG: Check for image field
        if (spine.recipe_metadata && spine.recipe_metadata.length > 0) {
            // console.log("[DataLayer] Metadata Keys:", Object.keys(spine.recipe_metadata[0]));
        }

        // Filter for English Title (Source of Truth) because we are in Fallback
        const enMeta = spine.content_translations?.find(t => t.language_code === 'en') || {};

        // 1. Parse QA Metadata (Rich Content) FIRST
        const qa = enMeta.qa_metadata || {};

        // Resolve Category (Priority: QA -> DB Meta -> Default)
        const displayCategory = qa.category || spine.recipe_metadata?.[0]?.cuisine || spine.recipe_metadata?.[0]?.category || 'Global';

        // FORCE LOCAL IMAGE (Governance)
        const imageSrc = `/recipe-images/${uuid}.jpg`;

        // 2. Construct Nutrition Info Object with Rich Data
        const nutritionInfo = {
            en: {
                name: enMeta.title || "Untitled Recipe",
                description: enMeta.description || "",
                ingredients: spine.recipe_ingredients.map(ing => (ing.note_text ? `${ing.label_text || ing.raw_text}, ${ing.note_text}` : ing.label_text || ing.raw_text)),
                instructions: spine.recipe_steps.map(s => s.instruction_text || s.instruction),
                times: {
                    prep: spine.recipe_metadata?.[0]?.prep_time_minutes || 30,
                    cook: spine.recipe_metadata?.[0]?.cook_time_minutes || 45
                },
                difficulty_level: spine.recipe_metadata?.[0]?.difficulty || 'Medium',
                category: displayCategory,
                nutrition: { calories: 0, protein: "0g", carbs: "0g", fat: "0g" },

                // EXPOSE CHEF ZAFFARON FIELDS (Rich UI)
                internal_score: qa.internal_score,
                chef_swaps: qa.chef_swaps,
                origin_history: qa.origin_history,
                marketing_description: qa.marketing_description,
                flavor_profile: qa.flavor_profile,          // DNA
                sensory_experience: qa.sensory_experience,  // Sensory Text
                chef_guide: qa.chef_guide                   // Pro Tips, Mistakes, Storage
            }
        };

        // LOGGING PROOF
        try { const fs = require('fs'); if (!fs.existsSync('logs')) fs.mkdirSync('logs'); fs.appendFileSync('logs/data_access.log', `[${new Date().toISOString()}] FETCH|${slug}|${lang}|${compiled ? 'COMPILED' : 'FALLBACK'}|${uuid}\n`); } catch (e) { }

        // 3. Return Final Prop Object
        return {
            id: spine.id,
            legacy_id: spine.legacy_recipe_id,
            name: enMeta.title || "Untitled Recipe",
            description: enMeta.description || "",
            // Map Metadata
            prep_time_minutes: spine.recipe_metadata?.[0]?.prep_time_minutes || 30,
            cook_time_minutes: spine.recipe_metadata?.[0]?.cook_time_minutes || 45,
            difficulty: spine.recipe_metadata?.[0]?.difficulty || 'Medium',
            category: displayCategory,

            // Image Logic
            image: imageSrc,

            // Map Ingredients (Flatten to Strings for UI Compatibility)
            ingredients: spine.recipe_ingredients.map(ing => {
                const raw = ing.label_text || ing.raw_text || "";
                const note = ing.note_text;
                return note ? `${raw}, ${note}` : raw;
            }),

            // Map Instructions
            instructions: spine.recipe_steps.map(s => s.instruction_text || s.instruction),

            nutrition_info: nutritionInfo, // INJECT RICH DATA

            // System Meta
            _lang: 'en', // Forced EN fallback
            _source: 'hard_spine_live_v2'
        };

    } catch (err) {
        console.error(`[DataLayer] Critical Error:`, err);
        return null;
    }
}

// Helper to normalize compiled JSON to Frontend Props
function normalizeCompiled(json, id, lang) {
    const stepsArray = Array.isArray(json.instructions) ? json.instructions : (Array.isArray(json.steps) ? json.steps : []);
    const ingsArray = Array.isArray(json.ingredients) ? json.ingredients : [];

    const normInstructions = stepsArray.map(s => {
        if (typeof s === 'string') {
            // Check for JSON string "{\"step\":...}"
            if (s.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(s);
                    return parsed.instruction || parsed.text || parsed.step || s;
                } catch {
                    return s;
                }
            }
            return s;
        }
        // Handle Object
        if (typeof s === 'object' && s !== null) {
            return s.instruction || s.text || s.raw_text || "";
        }
        return "";
    }).filter(s => s && s.trim().length > 0);
    const normIngredients = ingsArray.map(i => {
        const label = i.label || i.text || "";
        const note = i.note;
        return note ? `${label}, ${note}` : label;
    });

    const nutritionInfo = {
        [lang]: {
            name: json.title,
            description: json.description,
            ingredients: normIngredients,
            instructions: normInstructions,
            times: {
                prep: json.metadata?.prep_time || 0,
                cook: json.metadata?.cook_time || 0
            },
            difficulty_level: json.metadata?.difficulty || 'Medium',
            category: json.category || 'Global',
            nutrition: {
                calories: json.metadata?.calories || 0,
                protein: "0g",
                carbs: "0g",
                fat: "0g"
            },
            // EXPOSE ALL RICH FIELDS
            internal_score: json.internal_score,
            chef_swaps: json.chef_swaps,
            origin_history: json.origin_history,
            marketing_description: json.marketing_description,
            flavor_profile: json.flavor_profile,
            sensory_experience: json.sensory_experience,
            chef_guide: json.chef_guide
        }
    };

    return {
        id: id,
        name: json.title,
        description: json.description,
        instructions: normInstructions,
        ingredients: normIngredients,
        prep_time_minutes: json.metadata?.prep_time,
        cook_time_minutes: json.metadata?.cook_time,
        difficulty: json.metadata?.difficulty,
        nutrition_info: nutritionInfo,

        // Ensure image is passed if available in compiled view
        // FORCE LOCAL IMAGE (Governance)
        image: `/recipe-images/${id}.jpg`,

        _lang: lang,
        _source: 'compiled_view'
    };
}
