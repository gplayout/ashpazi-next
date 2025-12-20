
// Standalone logic verification
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getRecipeBySlug_Standalone(slug) {
    if (!slug) return null;

    console.log(`[Standalone] Lookup Slug: "${slug}"`);

    // Tier 3 Replica
    // e.g. "Classic-Chinese-Style" -> "Classic%Chinese%Style" matches "Classic Chinese-Style"
    const nameQuery = slug.split('-').join('%');
    console.log(`[Standalone] Tier 3 Query: "${nameQuery}"`);

    const { data: legacyRecipe, error } = await supabase
        .from('recipes')
        .select(`
            *,
            recipe_translations(
                language,
                title,
                description,
                ingredients,
                instructions
            )
        `)
        .ilike('name_en', nameQuery)
        .maybeSingle();

    if (error) {
        console.error("Supabase Error:", error);
    }

    if (legacyRecipe) {
        console.log(`[Standalone] Found Legacy: ${legacyRecipe.id}`);

        // Test Upgrade Logic
        const { data: upgrade, error: upgradeError } = await supabase
            .from('registry_recipes')
            // Note: The original code does nested join which might be tricky if not set up right
            // .select('content_translations(title, instructions, ingredients, qa_metadata, language_code, publish_status)')
            // Let's test the EXACT query from data.js to see if it fails
            .select('content_translations(title, instructions, ingredients, qa_metadata, language_code, publish_status)')
            .eq('legacy_recipe_id', legacyRecipe.id)
            .eq('content_translations.language_code', 'en')
            .limit(1)
            .maybeSingle();

        if (upgradeError) {
            console.error("Upgrade Query Error:", upgradeError);
        } else {
            // console.log("Upgrade Data Raw:", JSON.stringify(upgrade, null, 2));
            const newContent = upgrade?.content_translations;
            const validTrans = Array.isArray(newContent) ? newContent[0] : newContent;
            if (validTrans) {
                console.log("SUCCESS: Found Upgrade Translation!");
                console.log("FULL QA METADATA:", JSON.stringify(validTrans.qa_metadata, null, 2));
            } else {
                console.log("FAILURE: Upgrade found but content_translations is null/empty.");
            }
        }

        return legacyRecipe;
    }

    return null;
}

getRecipeBySlug_Standalone('Classic-Chinese-Style-Egg-Fried-Rice');
