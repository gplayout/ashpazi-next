
const { getRecipeBySlug } = require('./src/lib/data');

// Mock environmental variables if needed, assuming local .env.local works via dotenv
require('dotenv').config({ path: '.env.local' });

async function check() {
    // The UUID for Khoresht Piazagh (from find_german_5.js)
    // ID: 616b36cb-d9dc-40cf-80fe-3bbaae257386
    const uuid = '616b36cb-d9dc-40cf-80fe-3bbaae257386';

    console.log(`Checking UUID: ${uuid}`);
    const recipe = await getRecipeBySlug(uuid);

    if (!recipe) {
        console.log("Recipe NOT FOUND.");
        return;
    }

    console.log("Recipe Found:", recipe.name);
    console.log("Recipe ID:", recipe.id);
    console.log("Recipe Lang (Default):", recipe._lang);

    if (recipe.nutrition_info) {
        console.log("Nutrition Info Keys:", Object.keys(recipe.nutrition_info));
        if (recipe.nutrition_info.de) {
            console.log("✅ German Data Present in nutrition_info");
            console.log("   Title:", recipe.nutrition_info.de.name);
        } else {
            console.log("❌ German Data MISSING in nutrition_info");
        }
    } else {
        console.log("❌ nutrition_info is missing entirely.");
    }
}

check();
