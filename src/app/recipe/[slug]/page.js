import { notFound } from 'next/navigation';
import { getRecipeBySlug } from '@/lib/data';
import RecipeDetailClient from '@/components/RecipeDetailClient';
import JsonLdScript from '@/components/JsonLdScript';
import { getOffer } from '@/lib/marketplace/offers';
import OrderCTA from '@/components/OrderCTA';

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
    // Priority: AI Description -> DB Description -> Translations
    const ni = recipe.nutrition_info?.en || recipe.nutrition_info?.english || {};
    const displayDesc = ni.description || recipe.description || recipe.recipe_translations?.find(t => t.language === 'en')?.description || `Order ${displayTitle} from top local chefs or cook it yourself with Zaffaron.`;

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
        alternates: {
            classes: 'notranslate', // Hint to Google Translate to not double-translate
            languages: {
                // Link self
                [recipe._lang === 'en' ? 'en-US' : 'fa-IR']: `https://zaffaron.com/recipe/${slug}`,
                // Link counterpart via ID fallback (since we don't know the exact other slug easily)
                [recipe._lang === 'en' ? 'fa-IR' : 'en-US']: `https://zaffaron.com/recipe/${recipe.id}`,
            },
        },
    };
}

// Helper to build JSON-LD
function buildJsonLd(recipe) {
    const ni = recipe.nutrition_info?.en || recipe.nutrition_info?.english || {};

    // Fallback logic: AI Title -> Translation -> DB English -> DB Farsi
    const title = ni.name || recipe.name_en || recipe.recipe_translations?.[0]?.title || recipe.name || 'Recipe';

    // Fallback logic: AI Description -> DB Description
    const description = ni.description || recipe.description || `Order ${title} from top local chefs or cook it yourself with Zaffaron.`;

    // Time Logic: Prefer AI times
    const prepTime = ni.times?.prep || recipe.prep_time_minutes || 30;
    const cookTime = ni.times?.cook || recipe.cook_time_minutes || 45;

    // Nutrition Logic
    const calories = ni.nutrition?.calories ? `${ni.nutrition.calories} kcal` : "350 kcal";

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
        "description": description,
        "prepTime": `PT${prepTime}M`,
        "cookTime": `PT${cookTime}M`,
        "totalTime": `PT${prepTime + cookTime}M`,
        "recipeYield": "4 servings",
        "recipeCategory": recipe.category || "Global Cuisine",
        "recipeCuisine": recipe.category || "International",
        "keywords": `${title}, ${recipe.category || 'Global Food'}, Zaffaron`,
        "recipeIngredient": ni.ingredients || recipe.ingredients || [],
        "recipeInstructions": (ni.instructions || recipe.instructions || []).map((step, idx) => ({
            "@type": "HowToStep",
            "position": idx + 1,
            "text": step
        })),
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "156",
            "bestRating": "5",
            "worstRating": "1"
        },
        "nutrition": {
            "@type": "NutritionInformation",
            "calories": calories,
            "proteinContent": ni.nutrition?.protein,
            "fatContent": ni.nutrition?.fat,
            "carbohydrateContent": ni.nutrition?.carbs
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

    const offer = getOffer(slug);
    if (offer) {
        console.log(`[Metric] Offer Active for slug: "${slug}" (Channel: ${offer.channel})`);
    }

    return (
        <>
            <JsonLdScript data={jsonLd} />

            {/* MVP Transaction Layer - Config Driven */}
            {offer && <OrderCTA offer={offer} slug={slug} />}

            <RecipeDetailClient recipe={recipe} />
        </>
    );
}

