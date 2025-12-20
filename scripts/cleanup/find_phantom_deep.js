const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findDeep() {
    const snippet = "%traces its roots%";
    console.log(`Searching DEEP for "${snippet}"...`);

    // 1. Translations (Instructions as text)
    const { data: trans, error: transErr } = await supabase
        .from('content_translations')
        .select('recipe_id, title')
        // Cast jsonb to text for searching
        .or(`instructions.ilike.${snippet},qa_metadata.ilike.${snippet}`);

    if (trans && trans.length > 0) {
        console.log("✅ FOUND IN TRANSLATIONS!");
        console.log(trans);
        // Find Legacy ID too
        const { data: reg } = await supabase.from('registry_recipes').select('legacy_recipe_id').eq('id', trans[0].recipe_id).single();
        console.log(`Legacy ID: ${reg?.legacy_recipe_id}`);
        return;
    }

    // 2. Legacy Recipes
    const { data: leg, error: legErr } = await supabase
        .from('recipes')
        .select('id, name')
        .or(`description.ilike.${snippet},instructions.ilike.${snippet}`);

    if (leg && leg.length > 0) {
        console.log("✅ FOUND IN LEGACY RECIPES!");
        console.log(leg);
        return;
    }

    console.log("❌ Not found anywhere in DB text.");
}

findDeep();
