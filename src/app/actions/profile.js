'use server'

import { createClient } from '@/utils/supabase/server'

export async function getSavedRecipes() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data, error } = await supabase
        .from('saved_recipes')
        .select(`
      recipe_id,
      recipes (
        *
      )
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching saved recipes:', error)
        return []
    }

    // Flatten to just Recipe Objects
    const recipes = data.map(item => item.recipes).filter(Boolean);

    if (recipes.length === 0) return [];

    // --- Second Hop for Translations ---
    const recipeIds = recipes.map(r => r.id);

    // 1. Registry Map
    const { data: registryMap } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .in('legacy_recipe_id', recipeIds);

    const idToUuid = {};
    const uuids = [];
    if (registryMap) {
        registryMap.forEach(row => {
            idToUuid[row.legacy_recipe_id] = row.id;
            uuids.push(row.id);
        });
    }

    // 2. Translations
    let translations = [];
    if (uuids.length > 0) {
        const { data: transData } = await supabase
            .from('content_translations')
            .select('recipe_id, language_code, title, instructions, qa_metadata')
            .in('recipe_id', uuids);

        if (transData) translations = transData;
    }

    // 3. Stitch
    return recipes.map(recipe => {
        const uuid = idToUuid[recipe.id];
        const matchingTranslations = translations.filter(t => t.recipe_id === uuid);
        return {
            ...recipe,
            recipe_translations: matchingTranslations || []
        };
    });
}
