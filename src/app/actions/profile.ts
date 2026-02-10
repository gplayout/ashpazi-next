'use server';

import { createClient } from '@/utils/supabase/server';

interface RecipeTranslation {
    recipe_id: string;
    language_code: string;
    title: string;
    instructions: string;
    qa_metadata: Record<string, unknown> | null;
}

interface Recipe {
    id: number;
    [key: string]: unknown;
}

interface SavedRecipeRow {
    recipe_id: number;
    recipes: Recipe | null;
}

interface RegistryRow {
    legacy_recipe_id: number;
    id: string;
}

interface RecipeWithTranslations extends Recipe {
    recipe_translations: RecipeTranslation[];
}

export async function getSavedRecipes(): Promise<RecipeWithTranslations[]> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('saved_recipes')
        .select(
            `
      recipe_id,
      recipes (
        *
      )
    `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching saved recipes:', error);
        return [];
    }

    // Flatten to just Recipe Objects
    const recipes: Recipe[] = (data as unknown as SavedRecipeRow[])
        .map(item => item.recipes)
        .filter(Boolean) as Recipe[];

    if (recipes.length === 0) return [];

    // --- Second Hop for Translations ---
    const recipeIds = recipes.map(r => r.id);

    // 1. Registry Map
    const { data: registryMap } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .in('legacy_recipe_id', recipeIds);

    const idToUuid: Record<number, string> = {};
    const uuids: string[] = [];
    if (registryMap) {
        (registryMap as RegistryRow[]).forEach(row => {
            idToUuid[row.legacy_recipe_id] = row.id;
            uuids.push(row.id);
        });
    }

    // 2. Translations
    let translations: RecipeTranslation[] = [];
    if (uuids.length > 0) {
        const { data: transData } = await supabase
            .from('content_translations')
            .select('recipe_id, language_code, title, instructions, qa_metadata')
            .in('recipe_id', uuids);

        if (transData) translations = transData as RecipeTranslation[];
    }

    // 3. Stitch
    return recipes.map(recipe => {
        const uuid = idToUuid[recipe.id];
        const matchingTranslations = translations.filter(t => t.recipe_id === uuid);
        return {
            ...recipe,
            recipe_translations: matchingTranslations || [],
        };
    });
}
