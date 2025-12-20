
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkGerman() {
    console.log("Checking for German translations on Homepage recipes...");

    // 1. Get Top 5 Recipes (Homepage Logic)
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Fetch Error:", error);
        return;
    }

    // 2. Check Translations for these IDs
    const ids = recipes.map(r => r.id);
    console.log("Checking IDs:", ids);

    // We need to find the UUIDs for these Legacy IDs to check content_translations?
    // Wait, content_translations uses uuid. recipes uses integer id.
    // The previous analysis said:
    // recipes.id (int) -> registry_recipes.legacy_recipe_id -> registry_recipes.id (uuid) -> content_translations.recipe_id

    for (const r of recipes) {
        // Get UUID
        const { data: reg } = await supabase
            .from('registry_recipes')
            .select('id')
            .eq('legacy_recipe_id', r.id)
            .single();

        if (!reg) {
            console.log(`[${r.id}] No UUID found in registry!`);
            continue;
        }

        const uuid = reg.id;

        // Get Translations
        const { data: trans } = await supabase
            .from('content_translations')
            .select('language_code, title')
            .eq('recipe_id', uuid);

        const langs = trans ? trans.map(t => t.language_code) : [];
        console.log(`[${r.id}] ${r.name} -> UUID: ${uuid} | Langs: [${langs.join(', ')}]`);

        const hasDe = langs.includes('de');
        if (!hasDe) {
            console.warn(` ⚠️ Missng German for ${r.id}`);
        }
    }
}

checkGerman();
