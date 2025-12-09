import { supabase } from './supabase';
import { translationDB } from '@/utils/aiTranslation';
import { generateSlug } from '@/utils/slugUtils';

// Helper to find recipe by slug (Server Side)
export async function getRecipeBySlug(slug) {
    // console.log(`[getRecipeBySlug] Lookup for slug: "${slug}"`);
    if (!slug) return null;

    const decoded = decodeURIComponent(slug);
    const normalized = decoded.replace(/-/g, ' ');

    // 1. Try to find a translation matching the title (Exact or Case-Insensitive)
    // We search across ALL languages now.
    const { data: translation, error } = await supabase
        .from('recipe_translations')
        .select('recipe_id')
        .or(`title.eq.${normalized},title.ilike.${normalized}`)
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('[getRecipeBySlug] Translation lookup error:', error);
    }

    if (translation) {
        // Fetch the full recipe with ALL translations
        const { data: recipe } = await supabase
            .from('recipes')
            .select('*, recipe_translations(*)')
            .eq('id', translation.recipe_id)
            .single();

        if (recipe) return recipe;
    }

    // 2. Legacy Fallback (searching 'recipes' table directly if columns still exist)
    const { data: legacyRecipe } = await supabase
        .from('recipes')
        .select('*, recipe_translations(*)')
        .or(`name.eq.${normalized},name.ilike.${normalized}`)
        .maybeSingle();

    if (legacyRecipe) return legacyRecipe;

    return null;
}
