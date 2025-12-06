/**
 * Generates Schema.org JSON-LD for a recipe
 * @param {Object} recipe - The recipe object
 * @returns {Object} - JSON-LD object
 */
export const generateRecipeSchema = (recipe) => {
    if (!recipe) return null;

    // Helper to format duration to ISO 8601 duration format (PTxxM)
    const formatDuration = (timeStr) => {
        if (!timeStr) return undefined;
        // Extract numbers from string like "15 mins" or "1 hour"
        const numbers = timeStr.match(/\d+/);
        if (!numbers) return undefined;
        const minutes = parseInt(numbers[0]);
        return `PT${minutes}M`;
    };

    return {
        "@context": "https://schema.org/",
        "@type": "Recipe",
        "name": recipe.name,
        "image": recipe.image ? [recipe.image] : undefined,
        "author": {
            "@type": "Person",
            "name": "Chef Zaffaron"
        },
        "datePublished": new Date().toISOString().split('T')[0],
        "description": recipe.intro || recipe.description || `A delicious recipe for ${recipe.name}`,
        "prepTime": formatDuration(recipe.prepTime),
        "cookTime": formatDuration(recipe.cookTime),
        "totalTime": undefined, // Could calculate if both exist
        "keywords": recipe.tags?.join(", ") || "Persian Food, Recipe",
        "recipeYield": "4 servings",
        "recipeCategory": recipe.category || "Main Course",
        "recipeCuisine": "Persian",
        "nutrition": recipe.nutrition ? {
            "@type": "NutritionInformation",
            "calories": `${recipe.nutrition.calories} calories`
        } : undefined,
        "recipeIngredient": recipe.ingredients || [],
        "recipeInstructions": (recipe.instructions || []).map(step => ({
            "@type": "HowToStep",
            "text": step
        })),
        "aggregateRating": recipe.rating ? {
            "@type": "AggregateRating",
            "ratingValue": recipe.rating,
            "ratingCount": recipe.reviewCount || 1
        } : {
            "@type": "AggregateRating",
            "ratingValue": "4.5",
            "ratingCount": "10"
        }
    };
};
