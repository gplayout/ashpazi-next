import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaffaron.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Fetch all recipes
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, name_en, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Sitemap fetch error:', error);
        return [];
    }

    // 2. Generate recipe URLs
    const recipeUrls: MetadataRoute.Sitemap = [];

    // A. Original Recipes (Default FA/Legacy)
    recipes.forEach(recipe => {
        let slug = '';
        if (recipe.name_en) {
            slug = encodeURIComponent(recipe.name_en.replace(/\s+/g, '-').toLowerCase());
        } else {
            slug = encodeURIComponent(recipe.name || `recipe-${recipe.id}`);
        }
        recipeUrls.push({
            url: `${BASE_URL}/recipe/${slug}`,
            lastModified: recipe.created_at || new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        });
    });

    // B. New Translations (Phase 3.4)
    const { data: translations } = await supabase
        .from('content_translations')
        .select('title, last_updated, language_code')
        .eq('publish_status', 'published');

    if (translations) {
        translations.forEach(t => {
            // Slugify title
            const slug = encodeURIComponent(t.title.replace(/\s+/g, '-').toLowerCase());
            // Optionally append lang? Or logic in getRecipeBySlug handles title lookup.
            // Using same URL structure: /recipe/[title-slug]
            recipeUrls.push({
                url: `${BASE_URL}/recipe/${slug}`,
                lastModified: t.last_updated || new Date().toISOString(),
                changeFrequency: 'weekly' as const,
                priority: 0.9,
            });
        });
    }

    // 3. Static pages
    const staticPages = [
        {
            url: BASE_URL,
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/login`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly' as const,
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/profile`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
    ];

    return [...staticPages, ...recipeUrls];
}
