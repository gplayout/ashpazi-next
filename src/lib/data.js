import { supabase } from './supabase';
import { translationDB } from '@/utils/aiTranslation';
import { generateSlug } from '@/utils/slugUtils';

// Helper to find recipe by slug (Server Side)
export async function getRecipeBySlug(slug) {
    if (!slug) return null;

    const decoded = decodeURIComponent(slug);
    // Normalize: "Ghormeh-Sabzi" -> "Ghormeh Sabzi"
    const normalized = decoded.replace(/-/g, ' ');

    // Tier 0: Featured Aliases (Manual Map for MVP Marketing URLs)
    const FEATURED_ALIASES = {
        'ghormeh-sabzi': 1111,
        'fesenjan': 1059,       // Khoresh Fesenjan
        'kebab-koobideh': 866,  // Kebab Koobideh
        'tahchin': 1029,        // Tahchin Morgh
        'zereshk-polo': 1032,   // Zereshk Polo ba Morgh
        'white-pizza': 932      // NON-PERSIAN VALIDATION: Garlic & Onion White Pizza
    };

    if (FEATURED_ALIASES[slug]) {
        console.log(`[getRecipeBySlug] Resolving Alias: ${slug} -> ${FEATURED_ALIASES[slug]}`);
        const { data: byId } = await supabase
            .from('recipes')
            .select('*, recipe_translations(*)')
            .eq('id', FEATURED_ALIASES[slug])
            .single();
        if (byId) return byId;
    }

    // Tier 1: Is it a direct numeric ID? (Legacy ID support)
    // This catches cases like /recipe/123
    if (/^\d+$/.test(slug)) {
        console.log(`[getRecipeBySlug] Detected ID pattern: ${slug}`);
        const { data: byId } = await supabase
            .from('recipes')
            .select('*, recipe_translations(*)')
            .eq('id', slug)
            .single();
        if (byId) return byId;
    }

    // Tier 2: Check 'content_translations' (Published English Content)
    // This is the primary path for new SEO content.
    const { data: newTrans } = await supabase
        .from('content_translations')
        .select(`
            title, instructions, language_code, 
            registry_recipes!inner(legacy_recipe_id)
        `)
        .eq('publish_status', 'published')
        .or(`title.ilike.${normalized},title.eq.${normalized}`)
        .limit(1)
        .maybeSingle();

    if (newTrans && newTrans.registry_recipes?.legacy_recipe_id) {
        const { data: legacyCtx } = await supabase
            .from('recipes')
            .select('*')
            .eq('id', newTrans.registry_recipes.legacy_recipe_id)
            .single();

        if (legacyCtx) {
            return {
                ...legacyCtx,
                name: newTrans.title,
                name_en: newTrans.title,
                instructions: newTrans.instructions,
                _is_translation: true,
                _lang: newTrans.language_code
            };
        }
    }

    // Tier 3: Legacy Fallback (Legacy 'recipes' table)
    // Checks name and name_en for matches.
    console.log(`[getRecipeBySlug] Checking legacy 'recipes' for: "${normalized}"`);
    const { data: legacyRecipe } = await supabase
        .from('recipes')
        .select('*, recipe_translations(*)')
        .or(`name.ilike.${normalized},name.eq.${normalized},name_en.ilike.${normalized},name_en.eq.${normalized}`)
        .limit(1)
        .maybeSingle();

    if (legacyRecipe) {
        return legacyRecipe;
    }

    console.warn(`[getRecipeBySlug] FAILED. No match found for "${slug}"`);
    return null;
}
