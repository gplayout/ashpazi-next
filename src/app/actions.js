'use server'

import { createClient } from '@supabase/supabase-js';

// CRITICAL: Use Service Role Key to bypass RLS on server actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
    console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY is missing in actions.js!");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// --- FEATURE FLAG ---
const USE_MANIFEST = true; // Pilot Mode: ON

/**
 * Main Data Fetcher
 * Toggles between Solid State (Manifest) and Legacy (Stitched) based on flag.
 */
export async function fetchRecipes(page = 1, limit = 24, lang = 'en') {
    if (USE_MANIFEST) {
        return fetchRecipesManifest(page, limit, lang);
    } else {
        return fetchRecipesLegacy(page, limit);
    }
}

/**
 * SOLID STATE IMPLEMENTATION (Phase A)
 * Reads from pre-computed 'app_routes_manifest'.
 * Fast, Deterministic, Validated.
 */
async function fetchRecipesManifest(page, limit, lang) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const targetLang = lang || 'en';

    console.log(`[SolidState] Fetching for ${targetLang}`);
    console.time('SolidStateQuery');

    const { data, error } = await supabase
        .from('app_routes_manifest')
        .select('recipe_id, feed_card_props')
        .eq('language_code', targetLang)
        .eq('status', 'PUBLISHED')
        .order('compiled_at', { ascending: false })
        .range(from, to);

    console.timeEnd('SolidStateQuery');

    if (error) {
        console.error('Solid State Fetch Error:', error);
        return [];
    }

    return data.map(row => ({
        id: row.recipe_id, // Expose UUID as main ID
        ...row.feed_card_props,

        // COMPATIBILITY LAYER
        name: row.feed_card_props.title, // Map 'title' -> 'name' for RecipeCard
        prep_time_minutes: row.feed_card_props.time, // Map 'time' -> 'prep_time_minutes'

        registry_id: row.recipe_id,
        _source: 'manifest'
    }));
}

/**
 * LEGACY IMPLEMENTATION (Fallback)
 * Stitches 'recipes' + 'registry_recipes' + 'content_translations'.
 * Slow, Fragile, "The Old Way".
 */
async function fetchRecipesLegacy(page, limit) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    console.log(`[Legacy] Fetching recipes page ${page}`);

    // 1. Fetch Legacy Recipes (Spine)
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .range(from, to)
        .order('id', { ascending: false });

    if (error) {
        console.error('[Legacy] Fetch Error:', error);
        return [];
    }

    if (!recipes || recipes.length === 0) return [];

    // 2. Fetch Registry Map (Legacy ID -> UUID)
    const legacyIds = recipes.map(r => r.id);
    const { data: registryMap } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .in('legacy_recipe_id', legacyIds);

    // 3. Simple Enrichment
    const enriched = recipes.map(r => {
        const reg = registryMap?.find(jm => jm.legacy_recipe_id === r.id);
        return {
            ...r,
            registry_id: reg?.id || null,
            _source: 'legacy'
        };
    });

    return enriched;
}
