
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getRandomFrench() {
    // 1. Get 5 French translation records
    const { data: translations, error: trError } = await supabase
        .from('content_translations')
        .select('recipe_id, title')
        .eq('language_code', 'fr')
        .limit(5);

    if (trError) { console.error("Tr Error:", trError); return; }
    if (!translations || translations.length === 0) {
        console.log("No French translations found.");
        return;
    }

    // 2. Get UUIDs
    const uuids = translations.map(t => t.recipe_id);

    // 3. Resolve to Legacy IDs
    const { data: registry, error: regError } = await supabase
        .from('registry_recipes')
        .select('id, legacy_recipe_id')
        .in('id', uuids);

    if (regError) { console.error("Reg Error:", regError); return; }

    // 4. Resolve to Recipe Data
    const legacyIds = registry.map(r => r.legacy_recipe_id);
    const { data: recipes, error: rError } = await supabase
        .from('recipes')
        .select('id, name, name_en') // Removed slug to be safe
        .in('id', legacyIds);

    if (rError) { console.error("Recipe Error:", rError); return; }

    // 5. Construct Links
    console.log("=== 🇫🇷 French Sample Links ===");
    const shuffled = recipes.sort(() => 0.5 - Math.random()).slice(0, 2);

    shuffled.forEach(r => {
        const slug = r.slug || (r.name_en || r.name).toLowerCase().replace(/\s+/g, '-');
        console.log(`- ${r.name_en || r.name}: http://localhost:3000/recipe/${slug}?id=${r.id}`);
    });
}

getRandomFrench();
