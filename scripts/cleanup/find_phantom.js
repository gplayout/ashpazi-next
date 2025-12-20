const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findByContent() {
    const snippet = "Egg fried rice traces its roots";
    console.log(`Searching for description/instructions containing: "${snippet}"...`);

    // 1. Translations
    const { data, error } = await supabase
        .from('content_translations')
        .select('recipe_id, title, qa_metadata, instructions')
        .eq('language_code', 'en')
        .limit(5000); // FIX LIMIT

    if (error) {
        console.log(error);
        return;
    }

    console.log(`Scannning ${data.length} records...`);
    const found = data.find(r => {
        const desc = r.qa_metadata?.marketing_description || "";
        const inst = JSON.stringify(r.instructions);
        return desc.includes("traces its roots") || inst.includes("traces its roots");
    });

    if (found) {
        console.log("✅ FOUND PHANTOM RECORD IN TRANSLATIONS!");
        console.log(`ID: ${found.recipe_id}`);
        console.log(`Title: ${found.title}`);

        // Find legacy ID too
        const { data: reg } = await supabase.from('registry_recipes').select('legacy_recipe_id').eq('id', found.recipe_id).single();
        console.log(`Legacy ID: ${reg?.legacy_recipe_id}`);
        return;
    }

    // 2. Legacy Check
    console.log("Checking Legacy Recipes...");
    const { data: leg } = await supabase.from('recipes').select('id, name, description, instructions').limit(2000);
    const foundLeg = leg.find(r => {
        const d = r.description || "";
        const i = JSON.stringify(r.instructions || "");
        return d.includes("traces its roots") || i.includes("traces its roots");
    });

    if (foundLeg) {
        console.log("✅ FOUND PHANTOM IN LEGACY!");
        console.log(`ID: ${foundLeg.id} - ${foundLeg.name}`);
    } else {
        console.log("❌ Definitely not found in DB.");
    }
}

findByContent();
