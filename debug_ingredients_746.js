
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugIngredients746() {
    console.log("=== DEBUG INGREDIENTS 746 (English) ===");

    // 1. Get UUID from Registry
    const { data: reg, error: regErr } = await supabase
        .from('registry_recipes')
        .select('id')
        .eq('legacy_recipe_id', 746)
        .single();

    if (regErr) { console.error("Registry Error:", regErr); return; }

    // 2. Fetch Translation
    const { data: tr, error: trErr } = await supabase
        .from('content_translations')
        .select('ingredients')
        .eq('recipe_id', reg.id)
        .eq('language_code', 'en')
        .single();

    if (trErr) { console.error("Fetch Error:", trErr); return; }

    if (!tr) {
        console.log("No English row found.");
        return;
    }

    console.log("Ingredients Array check:", Array.isArray(tr.ingredients));
    console.log("Length:", tr.ingredients?.length);
    console.log("Sample:", JSON.stringify(tr.ingredients).slice(0, 200));
}

debugIngredients746();
