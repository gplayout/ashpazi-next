const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findRecipe() {
    console.log("Searching for Fried Rice...");
    // Search the LEGACY recipes table
    const { data, error } = await supabase
        .from('recipes')
        .select('id, name')
        .ilike('name', '%Fried Rice%')
        .limit(5);

    if (error) console.log(error);
    if (data && data.length > 0) {
        console.log("Found Legacy Recipes:", data);
        const targetId = data[0].id;
        console.log(`Targeting ID: ${targetId} (${data[0].name})`);

        // Find UUID from registry
        const { data: reg, error: regErr } = await supabase
            .from('registry_recipes')
            .select('id')
            .eq('legacy_recipe_id', targetId)
            .single();

        if (reg) {
            console.log("Target UUID:", reg.id);
            // Delete translation
            const { error: delErr } = await supabase
                .from('content_translations')
                .delete()
                .eq('recipe_id', reg.id)
                .eq('language_code', 'en');

            if (!delErr) console.log(`✅ Deleted translation for ${data[0].name}. Ready to re-run.`);
        } else {
            console.log("Registry entry not found.");
        }
    } else {
        console.log("Not found in Legacy.");
    }
}
findRecipe();
