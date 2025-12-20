'use server'

import { createClient } from '@supabase/supabase-js';

// CRITICAL: Use Service Role Key to bypass RLS on server actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
    console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY is missing in actions.js!");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// import { supabase } from '@/lib/supabase'; // <-- OLD (RLS Blocked)

/**
 * Fetches recipes with correct translation stitching.
 * 
 * PROBLEM: 'recipes' table uses Integer ID. 'content_translations' uses UUID.
 * There is no direct FK. We must go through 'registry_recipes'.
 * 
 * STRATEGY: "Second Hop Fetch" (Application-Layer Join)
 * 1. Fetch Page of Recipes (Legacy Table)
 * 2. Fetch UUID mappings from Registry
 * 3. Fetch Translations using UUIDs
 * 4. Stitch in memory
 */
export async function fetchRecipes(page = 1, limit = 24) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    console.log(`[FetchRecipes] Page ${page}, fetching with Metadata...`);

    // 1. Fetch Recipes (Legacy Data)
    // NOTE: Removed broken join `select('*, recipe_translations(*)')`
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .not('image', 'is', null) // Consistency check
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }

    if (!recipes || recipes.length === 0) return [];

    // 2. Fetch Registry Mapping (Integer ID -> UUID)
    const recipeIds = recipes.map(r => r.id);
    const { data: registryMap, error: regError } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .in('legacy_recipe_id', recipeIds);

    if (regError) {
        console.error('Error fetching registry map:', regError);
        // Fallback: return recipes without translations
        return recipes.map(r => ({ ...r, recipe_translations: [] }));
    }

    // Create Map: LegacyID -> UUID
    const idToUuid = {};
    const uuids = [];
    registryMap.forEach(row => {
        idToUuid[row.legacy_recipe_id] = row.id;
        uuids.push(row.id);
    });

    // 3. Fetch Translations (Using UUIDs)
    let translations = [];
    if (uuids.length > 0) {
        const { data: transData, error: transError } = await supabase
            .from('content_translations')
            .select('recipe_id, language_code, title, instructions, qa_metadata') // rich content
            .in('recipe_id', uuids);

        if (!transError && transData) {
            translations = transData;
        }
    }

    // 4. Stitch Data (In-Memory Join)
    const enrichedRecipes = recipes.map(recipe => {
        const uuid = idToUuid[recipe.id];
        const matchingTranslations = translations.filter(t => t.recipe_id === uuid);

        // DEBUG: Force Fake Data to test Transport
        // matchingTranslations.push({ language_code: 'en', description: 'HARDCODED_TEST' });

        return {
            ...recipe,
            recipe_translations: matchingTranslations // Use real logic, but looking suspicious
        };
    });

    // CRITICAL: Ensure serializability for Server Action -> Client Component
    // Supabase returns Date objects? No, usually strings. But to be 100% safe:
    return JSON.parse(JSON.stringify(enrichedRecipes));
}
