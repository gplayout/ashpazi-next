require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectRecipe(legacyId) {
    console.log(`\n🔍 INSPECTING RECIPE ID: ${legacyId} (Ghormeh Sabzi)\n`);

    // 1. Fetch Legacy Data
    const { data: legacy, error: err1 } = await supabase
        .from('recipes')
        .select('id, name, ingredients, instructions')
        .eq('id', legacyId)
        .single();

    if (err1) console.error("Legacy Fetch Error:", err1);
    else {
        console.log("🟦 LEGACY DATA (From 'recipes' table):");
        console.log("-------------------------------------");
        console.log("Name:", legacy.name);
        console.log("Ingredients (Raw):", legacy.ingredients);
        console.log("Instructions (Length):", legacy.instructions?.length || 0);
        console.log(JSON.stringify(legacy.instructions, null, 2));
    }

    // 2. Fetch Registry Mapping
    const { data: reg, error: err2 } = await supabase
        .from('registry_recipes')
        .select('id, legacy_recipe_id')
        .eq('legacy_recipe_id', legacyId)
        .single();

    if (err2 || !reg) {
        console.error("❌ Registry Mapping Not Found!");
        return;
    }
    console.log(`\n🔗 MAPPED UUID: ${reg.id}\n`);

    // 3. Fetch New Translation (Golden Content) - TRY ALL LANGS
    const { data: allTrans, error: err3 } = await supabase
        .from('content_translations')
        .select('id, language_code, title, publish_status')
        .eq('recipe_id', reg.id);

    if (err3) console.error("New Translation Fetch Error:", err3);
    else if (!allTrans || allTrans.length === 0) {
        console.log("📭 NO TRANSLATIONS FOUND (Any Language) for this ID.");
    } else {
        console.log(`🟨 FOUND ${allTrans.length} TRANSLATIONS:`);
        console.table(allTrans);
    }

    // 4. Check Pipeline State
    const { data: state, error: err4 } = await supabase
        .from('recipe_pipeline_state')
        .select('*')
        .eq('legacy_recipe_id', legacyId)
        .single();

    if (state) {
        console.log("\n🚦 PIPELINE STATE:");
        console.log(state);
    } else {
        console.log("\n⚠️ No Pipeline State record found.");
    }
}


inspectRecipe(1542); // Corn Dumplings
