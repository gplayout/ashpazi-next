
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log("🔍 Inspecting Tlatlocolotl (ID: 1542)...");

    // Get the recipe
    const { data: recipe, error } = await supabase
        .from('recipes')
        .select(`
            id, 
            name,
            ingredients,
            instructions,
            name_en, 
            ingredients_en, 
            instructions_en, 
            nutrition_info, 
            recipe_translations(language, title, description, ingredients, instructions)
        `)
        .eq('id', 1542)
        .single();

    if (error) {
        console.error("DB Error:", error.message);
        return;
    }

    console.log("\n---- Main Table ----");
    console.log("Name (Base):", recipe.name);
    console.log("Name (EN):", recipe.name_en);
    console.log("Ingredients (Base):", JSON.stringify(recipe.ingredients).substring(0, 50) + "...");
    console.log("Ingredients (EN):", JSON.stringify(recipe.ingredients_en).substring(0, 50) + "...");

    console.log("\n---- Nutrition Info (JSON) ----");
    if (recipe.nutrition_info?.en) {
        console.log("Name (JSON EN):", recipe.nutrition_info.en.name);
        console.log("Description (JSON EN):", recipe.nutrition_info.en.description);
    } else {
        console.log("⚠️ No nutrition_info.en found!");
    }

    console.log("\n---- Translations Table ----");
    recipe.recipe_translations.forEach(t => {
        console.log(`[${t.language}] Title: ${t.title}`);
        console.log(`[${t.language}] Desc: ${t.description?.substring(0, 50)}...`);
    });
}

main();
