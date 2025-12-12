
export const parseRecipe = (recipeText) => {
  if (!recipeText) return { ingredients: [], instructions: [] };

  // Normalize newlines and Persian characters
  const text = recipeText
    .replace(/\r\n/g, '\n')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    // Replace inline bullets with newlines to handle compacted lists
    .replace(/[▪•●]/g, '\n');

  // Define regex patterns for headers
  // We look for "Moavad Lazem" (Ingredients) and various forms of "Tarz Tahie" (Instructions)
  // Added support for "●" and other variations
  const ingredientsHeaderPattern = /(?:\*\*\*|▪|•|●)?\s*مواد لازم\s*(?:\*\*\*|:|•|●)?/i;
  const instructionsHeaderPattern = /(?:\*\*\*|▪|•|●)?\s*(?:طرز تهیه|روش تهیه|چگونگی تهیه|دستور پخت|روش پخت|طرز پخت)\s*(?:\*\*\*|:|•|●)?/i;

  // Find start indices
  const ingredientsMatch = text.match(ingredientsHeaderPattern);
  const instructionsMatch = text.match(instructionsHeaderPattern);

  let ingredientsRaw = '';
  let instructionsRaw = '';

  if (ingredientsMatch && instructionsMatch) {
    // Both present
    if (ingredientsMatch.index < instructionsMatch.index) {
      // Ingredients first (normal case)
      ingredientsRaw = text.substring(ingredientsMatch.index + ingredientsMatch[0].length, instructionsMatch.index);
      instructionsRaw = text.substring(instructionsMatch.index + instructionsMatch[0].length);
    } else {
      // Instructions first (unusual, but possible)
      instructionsRaw = text.substring(instructionsMatch.index + instructionsMatch[0].length, ingredientsMatch.index);
      ingredientsRaw = text.substring(ingredientsMatch.index + ingredientsMatch[0].length);
    }
  } else if (ingredientsMatch) {
    // Only ingredients found. 
    ingredientsRaw = text.substring(ingredientsMatch.index + ingredientsMatch[0].length);
  } else if (instructionsMatch) {
    // Only instructions found
    instructionsRaw = text.substring(instructionsMatch.index + instructionsMatch[0].length);

    // Check if there is text BEFORE instructions
    if (instructionsMatch.index > 0) {
      // Assume the text before instructions is ingredients
      ingredientsRaw = text.substring(0, instructionsMatch.index);
    }
  } else {
    // No headers found. Treat the whole text as instructions (or description).
    instructionsRaw = text;
  }

  const cleanLines = (str) => {
    if (!str) return [];
    return str
      .split('\n')
      .map(line => line.trim())
      // Remove bullet points and common prefixes like -, *, ▪, •, ●
      .map(line => line.replace(/^[-▪•*●.]+\s*/, ''))
      // Filter empty lines
      .filter(line => line.length > 0 && line !== '-' && !line.match(/^\s*$/));
  };

  return {
    ingredients: cleanLines(ingredientsRaw),
    instructions: cleanLines(instructionsRaw)
  };
};

export const getAllCategories = (data) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(cat => ({
    id: cat.id,
    title: cat.title,
    count: cat.items.length,
    preview: cat.items[0]?.name
  }));
};

export const getRecipesByCategory = (data, categoryId) => {
  const category = data.find(c => c.id === parseInt(categoryId));
  return category ? category.items : [];
};

export const findRecipeByName = (data, name) => {
  if (!name) return null;
  const decodedName = decodeURIComponent(name);

  // Try exact match first
  for (const category of data) {
    const recipe = category.items.find(item => item.name === decodedName || item.name === name);
    if (recipe) return recipe;
  }

  // Try replacing dashes with spaces (common URL pattern)
  const nameWithSpaces = decodedName.replace(/-/g, ' ');
  for (const category of data) {
    const recipe = category.items.find(item => item.name === nameWithSpaces);
    if (recipe) return recipe;
  }

  return null;
};
