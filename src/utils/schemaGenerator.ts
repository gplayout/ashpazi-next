interface SchemaRecipe {
    name: string;
    image?: string;
    intro?: string;
    description?: string;
    prepTime?: string;
    cookTime?: string;
    tags?: string[];
    category?: string;
    nutrition?: { calories: number };
    ingredients?: string[];
    instructions?: string[];
    rating?: number;
    reviewCount?: number;
}

export const generateRecipeSchema = (recipe: SchemaRecipe): Record<string, unknown> | null => {
    if (!recipe) return null;

    const formatDuration = (timeStr: string | undefined): string | undefined => {
        if (!timeStr) return undefined;
        const numbers = timeStr.match(/\d+/);
        if (!numbers) return undefined;
        const minutes = parseInt(numbers[0]);
        return `PT${minutes}M`;
    };

    return {
        '@context': 'https://schema.org/',
        '@type': 'Recipe',
        name: recipe.name,
        image: recipe.image ? [recipe.image] : undefined,
        author: {
            '@type': 'Person',
            name: 'Chef Zaffaron',
        },
        datePublished: new Date().toISOString().split('T')[0],
        description: recipe.intro || recipe.description || `A delicious recipe for ${recipe.name}`,
        prepTime: formatDuration(recipe.prepTime),
        cookTime: formatDuration(recipe.cookTime),
        totalTime: undefined,
        keywords: recipe.tags?.join(', ') || 'Persian Food, Recipe',
        recipeYield: '4 servings',
        recipeCategory: recipe.category || 'Main Course',
        recipeCuisine: 'Persian',
        nutrition: recipe.nutrition
            ? {
                  '@type': 'NutritionInformation',
                  calories: `${recipe.nutrition.calories} calories`,
              }
            : undefined,
        recipeIngredient: recipe.ingredients || [],
        recipeInstructions: (recipe.instructions || []).map(step => ({
            '@type': 'HowToStep',
            text: step,
        })),
        aggregateRating: recipe.rating
            ? {
                  '@type': 'AggregateRating',
                  ratingValue: recipe.rating,
                  ratingCount: recipe.reviewCount || 1,
              }
            : {
                  '@type': 'AggregateRating',
                  ratingValue: '4.5',
                  ratingCount: '10',
              },
    };
};
