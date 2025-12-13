import { notFound } from 'next/navigation';
import { getRecipeBySlug } from '@/lib/data';
import RecipeDetailClient from '@/components/RecipeDetailClient';
import JsonLdScript from '@/components/JsonLdScript';

// ISR: Force Dynamic for Debugging (0)
export const revalidate = 0;

// SEO Metadata Generation
export async function generateMetadata({ params }) {
    const { slug } = await params;
    console.log(`[RecipePage] generateMetadata slug: "${slug}"`);
    const recipe = await getRecipeBySlug(slug);
    if (!recipe) {
        console.warn(`[RecipePage] generateMetadata: Recipe NOT FOUND for slug: "${slug}"`);
        return { title: 'Recipe Not Found' };
    }

    // Priority: English Name -> Translation -> Base Name
    const displayTitle = recipe.name_en || recipe.recipe_translations?.find(t => t.language === 'en')?.title || recipe.name || 'Recipe';
    const displayDesc = recipe.description || recipe.recipe_translations?.find(t => t.language === 'en')?.description || 'Authentic Persian Recipe';

    return {
        title: `${displayTitle} | Zaffaron Recipes`,
        description: `Learn how to cook ${displayTitle}: ${displayDesc.slice(0, 150)}...`,
        openGraph: {
            title: `${displayTitle} | Zaffaron`,
            description: displayDesc.slice(0, 200),
            url: `https://zaffaron.com/recipe/${slug}`,
            siteName: 'Zaffaron',
            images: [
                {
                    url: recipe.image || '/og-default.jpg',
                    width: 1200,
                    height: 630,
                    alt: displayTitle,
                },
            ],
            locale: 'en_US',
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: displayTitle,
            description: displayDesc.slice(0, 200),
            images: [recipe.image || '/og-default.jpg'],
        },
    };
}

// Helper to build JSON-LD
function buildJsonLd(recipe) {
    const title = recipe.name || recipe.recipe_translations?.[0]?.title || 'Recipe';
    const ingredients = recipe.ingredients || recipe.recipe_translations?.[0]?.ingredients || [];
    const instructions = recipe.instructions || recipe.recipe_translations?.[0]?.instructions || [];
    const prepTime = recipe.prep_time_minutes || 30;
    const cookTime = recipe.cook_time_minutes || 45;

    return {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": title,
        "image": recipe.image || "https://zaffaron.com/og-default.jpg",
        "author": {
            "@type": "Organization",
            "name": "Zaffaron"
        },
        "datePublished": recipe.created_at || new Date().toISOString(),
        "description": recipe.description || `Authentic ${title} recipe from Zaffaron.`,
        "prepTime": `PT${prepTime}M`,
        "cookTime": `PT${cookTime}M`,
        "totalTime": `PT${prepTime + cookTime}M`,
        "recipeYield": "4 servings",
        "recipeCategory": recipe.category || "Main Course",
        "recipeCuisine": "Persian",
        "recipeIngredient": ingredients,
        "recipeInstructions": instructions.map((step, idx) => ({
            "@type": "HowToStep",
            "position": idx + 1,
            "text": step
        })),
        // Fake Rating (as approved by user)
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.7",
            "ratingCount": "128",
            "bestRating": "5",
            "worstRating": "1"
        },
        "nutrition": {
            "@type": "NutritionInformation",
            "calories": "350 kcal"
        }
    };
}

import { supabase } from '@/lib/supabase'; // Import supabase directly for ID fetch

export default async function RecipePage({ params, searchParams }) {
    const { slug } = await params;
    const { id } = await searchParams; // Get ID from query params

    console.log(`[RecipePage] Rendering. Slug: "${slug}", ID: "${id}"`);

    let recipe = await getRecipeBySlug(slug);

    // Link/Slug mismatch Fallback: If slug failed but we have an ID, fetch by ID
    if (!recipe && id) {
        console.log(`[RecipePage] Slug lookup failed. Attempting fallback lookup by ID: ${id}`);
        const { data } = await supabase
            .from('recipes')
            .select('*, recipe_translations(*)')
            .eq('id', id)
            .single();
        if (data) {
            console.log(`[RecipePage] Fallback Success! Retrieved recipe via ID.`);
            recipe = data;
        }
    }

    if (!recipe) {
        console.error(`[RecipePage] 404 Triggered! Recipe null for slug: "${slug}"`);
        notFound();
    }
    console.log(`[RecipePage] Success! Found recipe: ${recipe.id} - ${recipe.name}`);

    const jsonLd = buildJsonLd(recipe);

    return (
        <>
            <JsonLdScript data={jsonLd} />
            <RecipeDetailClient recipe={recipe} />
        </>
    );
}

