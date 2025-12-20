
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectRecipe() {
    console.log("🔍 Inspecting Salad Shirazi (ID 1567)...");

    const { data: trans, error } = await supabase
        .from('content_translations')
        .select('*')
        .eq('recipe_id', 1567)  // Assuming recipe_id FK points to recipes.id
        // The script inserted NEW rows. The registry maps legacy_id: 1 -> id: 1567.
        // Let's look up by the recipe_id (1567) directly if possible, OR via registry.

        // Actually, the previous script `find_restored.js` confirmed ID 1567 is Salad Shirazi.
        // So we check content_translations for recipe_id = 1567.
        .eq('language_code', 'en')
        .single();

    if (error) {
        console.log("❌ Error fetching translation:", error.message);

        // Fallback: check registry mapping
        const { data: reg } = await supabase.from('registry_recipes').select('*').eq('id', 1567).single();
        console.log("   Registry contents for 1567:", reg);
        return;
    }

    if (trans) {
        console.log("✅ Translation Found:");
        console.log("   Title:", trans.title);
        console.log("   QA Metadata keys:", Object.keys(trans.qa_metadata || {}));
        console.log("   Origin History:", trans.qa_metadata?.origin_history);
        console.log("   Sensory Profile:", trans.qa_metadata?.sensory_experience);
        console.log("   Chef Guide:", trans.qa_metadata?.chef_guide);
        console.log("   Full Metadata:", JSON.stringify(trans.qa_metadata, null, 2));
    } else {
        console.log("⚠️ No English translation row found for ID 1567.");
    }
}

inspectRecipe();
