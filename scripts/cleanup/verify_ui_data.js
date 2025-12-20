require('dotenv').config({ path: '.env.local' });
// We need to simulate the data.js logic manually since we can't import it easily with mixed CommonJS/ESM in this environment without setup
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyFrontendData() {
    const slug = '22'; // Validating ID 22
    console.log(`🔎 Verifying Data for ID: ${slug}`);

    // mimicing getRecipeBySlug logic roughly
    const { data: legacy } = await supabase.from('recipes').select('*, recipe_translations(*)').eq('id', slug).single();

    if (!legacy) { console.log('Legacy not found'); return; }

    const { data: upgrade } = await supabase
        .from('registry_recipes')
        .select('content_translations(*)')
        .eq('legacy_recipe_id', slug)
        .limit(1)
        .maybeSingle();

    const trans = upgrade?.content_translations?.[0];

    if (!trans) {
        console.log("❌ No Translation found via Registry");
        return;
    }

    console.log("✅ Translation Found!");
    const qa = trans.qa_metadata || {};

    console.log("\n📦 CHECKS FOR UI BOXES:");

    // 1. Macros Box (Above Health Benefits/Tags in Hero?)
    console.log("1. Nutrition/Macros:", qa.nutrition);

    // 2. Health Benefits (Tags in Hero)
    // Note: 'health_benefits' field? Gemlni Agent schema has 'dietary_tags' but not 'health_benefits' explicitly in top level?
    // Let's check schema in TranslationAgent.js
    // It has `dietary_tags` and `internal_score`.
    // It DOES NOT have `health_benefits` in the schema!
    // But `RecipeDetailClient.jsx` checks `nutritionData.health_benefits`.

    console.log("2. Health Benefits (nutritionData.health_benefits in UI):", qa.health_benefits ? "✅ Present" : "❌ MISSING");

    // 3. Substitutions (Above Veggie Tags in Sidebar)
    console.log("3. Substitutions (usage.substitutions):", qa.ingredient_substitutions ? `✅ Present (${qa.ingredient_substitutions.length})` : "❌ MISSING");

    // 4. Veggie Tags (Side bar)
    console.log("4. Dietary Tags:", qa.dietary_tags);
    console.log("5. Category (New):", qa.category);
}

verifyFrontendData();
