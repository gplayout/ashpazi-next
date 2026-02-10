import { createClient } from '@supabase/supabase-js';
import type { RecipeDTO } from '@/types';

// Server-side client using Service Role for "Always Render" access (avoids RLS blocking public views if any)
// In a real app, public view uses Anon key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

export async function buildRecipeDTO(slug: string, lang: string = 'en'): Promise<RecipeDTO | null> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch Master Skeleton
    const { data: master, error: masterError } = await supabase
        .from('master_recipes')
        .select('*')
        .eq('slug', slug)
        .single();

    if (masterError || !master) {
        return null; // 404 Contract: Only if Master is missing
    }

    // 2. Fetch Skin
    const { data: skin, error: skinError } = await supabase
        .from('localized_content')
        .select('*')
        .eq('recipe_id', master.id)
        .eq('lang_code', lang)
        .single();

    // 3. Fallback Skin (if lang != en and skin missing)
    let fallbackSkin: Record<string, any> | null = null;
    let isFallback: boolean = false;

    // If skin is not found OR has critical empty fields, we might want fallback?
    // Spec says: "If missing and lang != 'en', fetch EN skin"
    if (!skin || skinError) {
        if (lang !== 'en') {
            const { data: enSkin } = await supabase
                .from('localized_content')
                .select('*')
                .eq('recipe_id', master.id)
                .eq('lang_code', 'en')
                .single();
            fallbackSkin = enSkin;
            isFallback = true;
        }
    }

    // 4. Construct DTO (Flat, Render-Ready)
    const activeSkin = skin || fallbackSkin;

    const title: string = activeSkin?.title
        ? isFallback
            ? `${activeSkin.title} [EN]`
            : activeSkin.title
        : master.slug + ' (Title Missing)'; // Last resort

    const description: string = activeSkin?.description || '';

    // Arrays: Ensure strictly arrays of strings
    const ingredients: string[] =
        Array.isArray(activeSkin?.ingredients) && activeSkin.ingredients.length > 0
            ? activeSkin.ingredients
            : [];

    const instructions: string[] =
        Array.isArray(activeSkin?.instructions) && activeSkin.instructions.length > 0
            ? activeSkin.instructions
            : [];

    const quality_flags: string[] = activeSkin?.quality_flags || [];
    if (isFallback) quality_flags.push('FALLBACK_EN');
    if (!skin && !fallbackSkin) quality_flags.push('NO_CONTENT');

    return {
        identity: {
            uuid: master.id,
            slug: master.slug,
            image: master.image_url,
            lang: lang,
            is_fallback: isFallback,
        },
        meta: {
            prep_time_minutes: master.prep_time_minutes || 0,
            cook_time_minutes: master.cook_time_minutes || 0,
            servings: master.servings || 4,
            difficulty: master.difficulty || 'Medium',
            taxonomy: master.taxonomy || {},
        },
        content: {
            title,
            description,
            ingredients, // UI Rule: if empty, hide section
            instructions, // UI Rule: if empty, hide section
            quality_flags,
        },
    };
}
