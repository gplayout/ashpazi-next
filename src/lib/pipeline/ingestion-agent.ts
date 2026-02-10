import { pipelineClient as supabase } from '../pipeline-client';
import { ERROR_CODES } from './state-machine';

interface PipelineStateRow {
    legacy_recipe_id: number;
    [key: string]: unknown;
}

interface IngestionError {
    code: string;
    details?: string;
    tokens?: string[];
    raw_line?: string;
    stage: string;
}

interface IngestionResult {
    success: boolean;
    error?: IngestionError;
}

interface MappedIngredient {
    ingredient_id: string;
    unit_id: string | null;
    quantity_value: number | null;
    raw_note_fa: string;
    display_order: number;
}

// --- Cache State ---
let cachedIngKeys: string[] | null = null; // Array of names sorted by length desc
let cachedIngMap: Map<string, string> | null = null; // Map: Name -> ID
let cachedUnitKeys: string[] | null = null;
let cachedUnitMap: Map<string, string> | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hr

/**
 * Loads DB dictionaries into memory for greedy matching.
 */
async function loadDictionaries(): Promise<void> {
    const now = Date.now();
    if (cachedIngKeys && now - lastCacheTime < CACHE_TTL_MS) {
        return;
    }

    // Fetch FA translations
    const { data: ingData } = await supabase
        .from('ingredient_translations')
        .select('name, ingredient_id')
        .eq('language_code', 'fa');

    const { data: unitData } = await supabase
        .from('unit_translations')
        .select('name, unit_id')
        .eq('language_code', 'fa');

    if (!ingData || !unitData) {
        throw new Error('Failed to load dictionaries from DB');
    }

    // Helper to normalize keys for matching (clean spaces)
    const clean = (s: string | null): string => (s ? s.trim() : '');

    // Build Ingredient Map
    const ingMap = new Map();
    ingData.forEach(row => {
        const key = clean(row.name);
        if (key) ingMap.set(key, row.ingredient_id);
    });

    // Build Unit Map
    const unitMap = new Map();
    unitData.forEach(row => {
        const key = clean(row.name);
        if (key) unitMap.set(key, row.unit_id);
    });

    // Sort keys by length descending for greedy match
    cachedIngKeys = Array.from(ingMap.keys()).sort((a, b) => b.length - a.length);
    cachedIngMap = ingMap;

    cachedUnitKeys = Array.from(unitMap.keys()).sort((a, b) => b.length - a.length);
    cachedUnitMap = unitMap;

    lastCacheTime = now;
    console.log(
        `[Pipeline] Dictionaries refreshed internally. ${cachedIngKeys.length} ings, ${cachedUnitKeys.length} units.`
    );
}

export class IngestionAgent {
    /**
     * Processes a single recipe from 'new'/'manual_retry' -> 'normalized_ok'/'blocked_review'.
     * @param {object} recipeStateRow - The row from recipe_pipeline_state
     * @returns {Promise<{success: boolean, error: object|null}>}
     */
    static async process(recipeStateRow: PipelineStateRow): Promise<IngestionResult> {
        try {
            // 1. Load Data
            await loadDictionaries();

            const legacyId = recipeStateRow.legacy_recipe_id;

            // Fetch Legacy Recipe
            const { data: legacyRecipe, error: fetchErr } = await supabase
                .from('recipes')
                .select('*')
                .eq('id', legacyId)
                .single();

            if (fetchErr || !legacyRecipe) {
                return {
                    success: false,
                    error: {
                        code: 'LEGACY_NOT_FOUND',
                        details: fetchErr?.message || 'Row missing',
                        stage: 'fetch_legacy',
                    },
                };
            }

            // 2. Parse Ingredients
            const rawIngredients: string[] = legacyRecipe.ingredients || [];
            const mappedIngredients: MappedIngredient[] = [];
            const validationErrors: IngestionError[] = [];

            let order = 0;
            for (const rawLine of rawIngredients) {
                order++;
                const cleanLine = rawLine.trim();
                if (!cleanLine) continue;

                let foundIngName: string | null = null;
                let foundUnitName: string | null = null;
                let quantity: number | null = null;

                // A. Find Ingredient (Greedy)
                for (const key of cachedIngKeys!) {
                    if (cleanLine.includes(key)) {
                        foundIngName = key;
                        break;
                    }
                }

                if (!foundIngName) {
                    validationErrors.push({
                        code: ERROR_CODES.ERR_INGREDIENT_UNMAPPED,
                        tokens: [],
                        raw_line: cleanLine,
                        stage: 'parsing_ingredients',
                    });
                    continue;
                }

                // B. Find Unit (Greedy)
                for (const key of cachedUnitKeys!) {
                    if (cleanLine.includes(key)) {
                        foundUnitName = key;
                        break;
                    }
                }

                // C. Parse Quantity (Start of string)
                // Regex for english or persian digits could be improved, strict for now to match Phase 2
                const numMatch = cleanLine.match(/^([\d\.\/]+)/);
                if (numMatch) {
                    const parsed = parseFloat(numMatch[1]);
                    if (!isNaN(parsed)) quantity = parsed;
                }

                mappedIngredients.push({
                    ingredient_id: cachedIngMap!.get(foundIngName)!,
                    unit_id: foundUnitName ? (cachedUnitMap!.get(foundUnitName) ?? null) : null,
                    quantity_value: quantity,
                    raw_note_fa: cleanLine,
                    display_order: order,
                });
            }

            // 3. Validation Gate
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    error: validationErrors[0], // Return first error for the log, or array if schema allows
                };
            }

            // 4. Write to Registry (Transaction-like)
            // Note: Supabase REST doesn't support transactions easily.
            // We will do cascading inserts. If fail, we throw keys.

            // A. Upsert Registry Recipe
            const regPayload = {
                legacy_recipe_id: legacyId,
                prep_time_minutes: legacyRecipe.prep_time || 0,
                cook_time_minutes: legacyRecipe.cook_time || 0,
                difficulty: 1, // Default
            };

            const { data: regRes, error: regErr } = await supabase
                .from('registry_recipes')
                .upsert(regPayload, { onConflict: 'legacy_recipe_id' })
                .select('id')
                .single();

            if (regErr) throw new Error(`Registry Insert Failed: ${regErr.message}`);
            const newRecipeId = regRes.id;

            // B. Ensure 'main' Group
            const { data: groupRes, error: groupErr } = await supabase
                .from('recipe_groups')
                .upsert(
                    {
                        recipe_id: newRecipeId,
                        slug: 'main',
                        display_order: 0,
                    },
                    { onConflict: 'recipe_id, slug' }
                ) // Assuming generic constraint/logic
                .select('id')
                .single();

            // Note: If no composite unique constraint on (recipe_id, slug), this might duplicate.
            // Phase 2 script did insert. We should check schema.
            // Assuming user will add constraint or we just select first.
            // Safety: Select first, if not create.

            let groupId = groupRes?.id;
            if (groupErr || !groupId) {
                // Fallback if upsert fails or constraint missing
                const { data: g2 } = await supabase
                    .from('recipe_groups')
                    .select('id')
                    .eq('recipe_id', newRecipeId)
                    .eq('slug', 'main')
                    .single();
                if (g2) groupId = g2.id;
                else {
                    const { data: g3, error: g3Err } = await supabase
                        .from('recipe_groups')
                        .insert({ recipe_id: newRecipeId, slug: 'main', display_order: 0 })
                        .select('id')
                        .single();
                    if (g3Err) throw new Error(`Group creation failed: ${g3Err.message}`);
                    groupId = g3.id;
                }
            }

            // C. Overwrite Ingredients
            // (Delete old for this recipe to ensure idempotent state)
            await supabase.from('recipe_ingredients').delete().eq('recipe_id', newRecipeId);

            const ingPayloads = mappedIngredients.map(item => ({
                ...item,
                recipe_id: newRecipeId,
                group_id: groupId,
            }));

            if (ingPayloads.length > 0) {
                const { error: ingErr } = await supabase
                    .from('recipe_ingredients')
                    .insert(ingPayloads);

                if (ingErr) throw new Error(`Ingredient Insert Failed: ${ingErr.message}`);
            }

            return { success: true };
        } catch (e) {
            return {
                success: false,
                error: {
                    code: ERROR_CODES.INGESTION_ERROR,
                    details: (e as Error).message,
                    stage: 'internal_agent_error',
                },
            };
        }
    }
}
