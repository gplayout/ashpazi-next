
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSchema() {
    console.log("🔍 Inspecting 'recipes' table structure...");

    // Fetch one recipe to see the object keys
    const { data, error } = await supabase
        .from('recipes')
        .select('*, recipe_translations(*)')
        .limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (data && data.length > 0) {
        const r = data[0];
        console.log("\n--- Recipes Table Keys ---");
        console.log(Object.keys(r));

        console.log("\n--- Sample Ingredient Structure ---");
        console.log(JSON.stringify(r.ingredients, null, 2));

        console.log("\n--- Sample Translation Structure ---");
        console.log(JSON.stringify(r.recipe_translations, null, 2));
    } else {
        console.log("No recipes found to inspect.");
    }
}

inspectSchema();
