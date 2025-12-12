import { supabase } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaffaron.com';

export default async function sitemap() {
    // 1. Fetch all recipes
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Sitemap fetch error:', error);
        return [];
    }

    // 2. Generate recipe URLs
    const recipeUrls = recipes.map((recipe) => {
        // Generate slug from name (same logic as RecipeCard)
        const slug = encodeURIComponent(recipe.name || `recipe-${recipe.id}`);
        return {
            url: `${BASE_URL}/recipe/${slug}`,
            lastModified: recipe.created_at || new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.8,
        };
    });

    // 3. Static pages
    const staticPages = [
        {
            url: BASE_URL,
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/login`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/profile`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    return [...staticPages, ...recipeUrls];
}
