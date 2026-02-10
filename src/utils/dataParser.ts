interface ParsedRecipe {
    ingredients: string[];
    instructions: string[];
}

interface CategorySummary {
    id: number;
    title: string;
    count: number;
    preview: string | undefined;
}

interface CategoryData {
    id: number;
    title: string;
    items: { name: string; [key: string]: unknown }[];
}

export const parseRecipe = (recipeText: string): ParsedRecipe => {
    if (!recipeText) return { ingredients: [], instructions: [] };

    const text = recipeText
        .replace(/\r\n/g, '\n')
        .replace(/ي/g, 'ی')
        .replace(/ك/g, 'ک')
        .replace(/[▪•●]/g, '\n');

    const ingredientsHeaderPattern = /(?:\*\*\*|▪|•|●)?\s*مواد لازم\s*(?:\*\*\*|:|•|●)?/i;
    const instructionsHeaderPattern =
        /(?:\*\*\*|▪|•|●)?\s*(?:طرز تهیه|روش تهیه|چگونگی تهیه|دستور پخت|روش پخت|طرز پخت)\s*(?:\*\*\*|:|•|●)?/i;

    const ingredientsMatch = text.match(ingredientsHeaderPattern);
    const instructionsMatch = text.match(instructionsHeaderPattern);

    let ingredientsRaw = '';
    let instructionsRaw = '';

    if (ingredientsMatch && instructionsMatch) {
        if (ingredientsMatch.index! < instructionsMatch.index!) {
            ingredientsRaw = text.substring(
                ingredientsMatch.index! + ingredientsMatch[0].length,
                instructionsMatch.index!
            );
            instructionsRaw = text.substring(
                instructionsMatch.index! + instructionsMatch[0].length
            );
        } else {
            instructionsRaw = text.substring(
                instructionsMatch.index! + instructionsMatch[0].length,
                ingredientsMatch.index!
            );
            ingredientsRaw = text.substring(ingredientsMatch.index! + ingredientsMatch[0].length);
        }
    } else if (ingredientsMatch) {
        ingredientsRaw = text.substring(ingredientsMatch.index! + ingredientsMatch[0].length);
    } else if (instructionsMatch) {
        instructionsRaw = text.substring(instructionsMatch.index! + instructionsMatch[0].length);
        if (instructionsMatch.index! > 0) {
            ingredientsRaw = text.substring(0, instructionsMatch.index!);
        }
    } else {
        instructionsRaw = text;
    }

    const cleanLines = (str: string): string[] => {
        if (!str) return [];
        return str
            .split('\n')
            .map(line => line.trim())
            .map(line => line.replace(/^[-▪•*●.]+\s*/, ''))
            .filter(line => line.length > 0 && line !== '-' && !line.match(/^\s*$/));
    };

    return {
        ingredients: cleanLines(ingredientsRaw),
        instructions: cleanLines(instructionsRaw),
    };
};

export const getAllCategories = (data: CategoryData[]): CategorySummary[] => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(cat => ({
        id: cat.id,
        title: cat.title,
        count: cat.items.length,
        preview: cat.items[0]?.name,
    }));
};

export const getRecipesByCategory = (
    data: CategoryData[],
    categoryId: string
): CategoryData['items'] => {
    const category = data.find(c => c.id === parseInt(categoryId));
    return category ? category.items : [];
};

export const findRecipeByName = (
    data: CategoryData[],
    name: string
): CategoryData['items'][number] | null => {
    if (!name) return null;
    const decodedName = decodeURIComponent(name);

    for (const category of data) {
        const recipe = category.items.find(item => item.name === decodedName || item.name === name);
        if (recipe) return recipe;
    }

    const nameWithSpaces = decodedName.replace(/-/g, ' ');
    for (const category of data) {
        const recipe = category.items.find(item => item.name === nameWithSpaces);
        if (recipe) return recipe;
    }

    return null;
};
