
// Debug script independent of Next.js modules

// Mock Supabase environment for local script if needed, 
// but since we are importing from actions which uses @/lib/supabase, 
// we might need to rely on the relative path resolving or just copy the logic.
// Actually, 'import' syntax won't work in standard node script without babel/next. 
// I will reproduce the fetch logic here to "simulate" it exactly.

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugInstructions() {
    console.log("Debugging Instructions Data...");

    // 1. Fetch Recipes (Legacy Data)
    const { data: recipes } = await supabase
        .from('recipes')
        .select('*')
        .not('image', 'is', null)
        .order('created_at', { ascending: false })
        .limit(3);

    const recipeIds = recipes.map(r => r.id);

    // 2. Registry
    const { data: registryMap } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .in('legacy_recipe_id', recipeIds);

    const idToUuid = {};
    const uuids = [];
    registryMap.forEach(row => {
        idToUuid[row.legacy_recipe_id] = row.id;
        uuids.push(row.id);
    });

    // 3. Translations
    const { data: translations } = await supabase
        .from('content_translations')
        .select('recipe_id, language_code, title, instructions') // <--- Target Field
        .in('recipe_id', uuids);

    // 4. Inspect
    translations.forEach(t => {
        if (t.language_code === 'de') {
            console.log(`\n[DE] Recipe UUID: ${t.recipe_id}`);
            console.log(`Title: ${t.title}`);
            console.log(`Instructions Type: ${typeof t.instructions}`);
            console.log(`Is Array? ${Array.isArray(t.instructions)}`);
            console.log(`Length: ${t.instructions ? t.instructions.length : 0}`);
            if (Array.isArray(t.instructions)) {
                console.log(`First Step: "${JSON.stringify(t.instructions[0])}"`);
            } else {
                console.log(`Content:`, t.instructions);
            }
        }
    });
}

debugInstructions();
