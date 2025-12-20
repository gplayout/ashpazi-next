require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectRecipe22() {
    console.log("🔍 Inspecting Recipe 22 Data...");

    // 1. Get UUID from Registry
    const { data: registry } = await supabase
        .from('registry_recipes')
        .select('id')
        .eq('legacy_recipe_id', 22)
        .single();

    if (!registry) {
        console.error("❌ Registry not found for 22");
        return;
    }

    // 2. Get Translation
    const { data: translation } = await supabase
        .from('content_translations')
        .select('*')
        .eq('recipe_id', registry.id)
        .eq('language_code', 'en')
        .single();

    if (!translation) {
        console.error("❌ Translation not found for 22");
        return;
    }

    console.log("\n📄 Title:", translation.title);
    console.log("\n🏷️ Tags (Dietary):", translation.qa_metadata.dietary_tags);
    console.log("🏷️ Tags (Occasion):", translation.qa_metadata.occasion_tags);
    console.log("💊 Health Benefits:", translation.qa_metadata.health_benefits);
    console.log("📝 Marketing Desc:", translation.qa_metadata.marketing_description);
    console.log("\n📦 Full Metadata Keys:", Object.keys(translation.qa_metadata));
}

inspectRecipe22();
