
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugRestoredDescriptions() {
    console.log("Debugging Descriptions for Restored Recipes...");

    // 1. Fetch Recipes (Restored Group)
    const { data: recipes } = await supabase
        .from('recipes')
        .select('id, name')
        .gte('id', 1584)
        .lte('id', 1605);

    const recipeIds = recipes.map(r => r.id);

    // 2. Registry
    const { data: registryMap } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .in('legacy_recipe_id', recipeIds);

    const uuids = registryMap.map(r => r.id);

    // 3. Translations
    const { data: translations } = await supabase
        .from('content_translations')
        .select('recipe_id, language_code, title, instructions, qa_metadata')
        .in('recipe_id', uuids);

    // 4. Inspect Logic
    translations.forEach(t => {
        if (t.language_code === 'de') { // Check German specifically
            console.log(`\n--- Recipe UUID: ${t.recipe_id} ---`);
            console.log(`Title: ${t.title}`);
            const meta = t.qa_metadata || {};
            const marketing = meta.marketing_description || meta.seo_meta_description;
            console.log(`Marketing Desc: "${marketing}"`);

            // Check Rejection Logic
            const isBad = !marketing || marketing.startsWith('TEST_') || marketing.trim().startsWith('{');
            const startsWithStep = marketing && marketing.startsWith('Step');

            console.log(`REJECTED by Logic? ${isBad || startsWithStep ? 'YES' : 'NO'}`);
            if (startsWithStep) console.log("Reason: Starts with 'Step'");

            // Check Instructon Fallback
            let firstInst = '';
            if (Array.isArray(t.instructions)) {
                const first = t.instructions[0];
                firstInst = (typeof first === 'object') ? first.text : first;
            }
            console.log(`Instruction Fallback: "${firstInst ? firstInst.substring(0, 50) + '...' : 'NONE'}"`);
        }
    });
}

debugRestoredDescriptions();
