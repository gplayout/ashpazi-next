
// Ensure environment is loaded
require('dotenv').config({ path: '.env.local' });

// We need to use dynamic import for the ES module, or mock the environment if it's mixed modules.
// src/lib/data.js uses `import` syntax, but this script is CommonJS. 
// We will try running this with `node` but might face module issues. 
// Instead, let's write an ESM script (.mjs).

import { getRecipeBySlug } from './src/lib/data.js';

async function test() {
    const slug = 'Classic-Chinese-Style-Egg-Fried-Rice';
    console.log(`Testing Lookup for: ${slug}`);

    try {
        const recipe = await getRecipeBySlug(slug);
        if (recipe) {
            console.log("SUCCESS! Recipe Found:");
            console.log("ID:", recipe.id);
            console.log("Name:", recipe.name);
            console.log("Translation:", recipe._is_translation);
        } else {
            console.log("FAILURE! Recipe returned null.");
        }
    } catch (e) {
        console.error("CRITICAL ERROR:", e);
    }
}

test();
