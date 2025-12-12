import { notFound } from 'next/navigation';
import { getRecipeBySlug } from '@/lib/data';
import RecipeDetailClient from '@/components/RecipeDetailClient';
import JsonLdScript from '@/components/JsonLdScript';

// ISR: Force Dynamic for Debugging (0)
export const revalidate = 0;

// SEO Metadata Generation
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const recipe = await getRecipeBySlug(slug);
    if (!recipe) return { title: 'Recipe Not Found' };

    const displayTitle = recipe.name || recipe.recipe_translations?.[0]?.title || 'Recipe';
    const displayDesc = recipe.description || recipe.recipe_translations?.[0]?.description || '';

    return {
        title: `${displayTitle} | Zaffaron Recipes`,
        description: `Learn how to cook authentic ${displayTitle}. ${displayDesc.slice(0, 100)}...`,
        openGraph: {
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

export default async function RecipePage({ params }) {
    const { slug } = await params;
    const recipe = await getRecipeBySlug(slug);

    if (!recipe) {
        notFound();
    }

    const jsonLd = buildJsonLd(recipe);

    return (
        <>
            <JsonLdScript data={jsonLd} />
            <RecipeDetailClient recipe={recipe} />
        </>
    );
}

