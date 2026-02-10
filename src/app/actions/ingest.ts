'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Validation Logic ---

interface ContentData {
    title?: string;
    ingredients?: string[];
    instructions?: string[];
    [key: string]: unknown;
}

interface SkeletonResult {
    success: boolean;
    error?: string;
    data?: Record<string, unknown>;
}

interface SkinResult {
    success: boolean;
    error?: string;
    data?: Record<string, unknown>;
    flags?: string[];
}

function detectFlags(data: ContentData, lang: string): string[] {
    const flags: string[] = [];
    const garbageRegex = /(undefined|null|\[object Object\]|^امشخص|\?\?)/i;
    const latinBleedRegex = /[a-zA-Z]{4,}/; // 4+ Latin chars

    // Check Title
    if (data.title && garbageRegex.test(data.title)) flags.push('GARBAGE_IN_TITLE');
    if (lang !== 'en' && data.title && latinBleedRegex.test(data.title))
        flags.push('LATIN_BLEED_TITLE');

    // Check Ingredients (Array)
    if (data.ingredients && data.ingredients.length === 0) flags.push('EMPTY_INGREDIENTS');
    data.ingredients?.forEach(ing => {
        if (garbageRegex.test(ing)) flags.push('GARBAGE_IN_INGREDIENTS');
    });

    // Instructions
    if (data.instructions && data.instructions.length === 0) flags.push('EMPTY_INSTRUCTIONS');

    return [...new Set(flags)]; // Unique
}

// --- Actions ---

export async function createSkeleton(formData: FormData): Promise<SkeletonResult> {
    const title = formData.get('title') as string;
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const payload = {
        slug: (formData.get('slug') as string) || slug,
        image_url: formData.get('image_url') as string,
        prep_time_minutes: parseInt((formData.get('prep_time') as string) || '0'),
        cook_time_minutes: parseInt((formData.get('cook_time') as string) || '0'),
        servings: parseInt((formData.get('servings') as string) || '4'),
        difficulty: formData.get('difficulty') as string,
        taxonomy: {
            region: formData.get('region') as string,
            tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()),
        },
    };

    const { data, error } = await supabase.from('master_recipes').insert(payload).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

export async function saveSkin(prevState: unknown, formData: FormData): Promise<SkinResult> {
    const recipe_id = formData.get('recipe_id') as string;
    const lang_code = formData.get('lang_code') as string;

    // Parse Lists (New Line separated in Text Area for simplicity in MVP UI)
    const ingredients =
        (formData.get('ingredients') as string)
            ?.split('\n')
            .map(s => s.trim())
            .filter(s => s) || [];
    const instructions =
        (formData.get('instructions') as string)
            ?.split('\n')
            .map(s => s.trim())
            .filter(s => s) || [];

    const rawData: Record<string, unknown> = {
        recipe_id,
        lang_code,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        ingredients,
        instructions,
        status: formData.get('status') === 'on' ? 'PUBLISHED' : 'DRAFT',
    };

    // Calculate Flags
    const flags = detectFlags(
        { title: rawData.title as string, ingredients, instructions },
        lang_code
    );
    rawData.quality_flags = flags;

    const { data, error } = await supabase
        .from('localized_content')
        .upsert(rawData, { onConflict: 'recipe_id, lang_code' })
        .select()
        .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Record<string, unknown>, flags }; // Return flags to UI to show warning
}
