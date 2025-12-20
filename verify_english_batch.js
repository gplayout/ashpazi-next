
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyRandomBatch() {
    console.log("🔍 Verifying 5 Random English Recipes...");

    // Get 5 random IDs
    const { data: allIds } = await supabase
        .from('content_translations')
        .select('recipe_id')
        .eq('language_code', 'en');

    if (!allIds || allIds.length === 0) {
        console.error("❌ No English translations found!");
        return;
    }

    // Shuffle and pick 5
    const sample = allIds.sort(() => 0.5 - Math.random()).slice(0, 5);

    for (const item of sample) {
        const { data: recipe } = await supabase
            .from('content_translations')
            .select(`
                recipe_id,
                title,
                instructions,
                qa_metadata,
                recipe:recipes!inner(id, legacy_id)
            `)
            .eq('recipe_id', item.recipe_id)
            .eq('language_code', 'en')
            .single();

        if (recipe) {
            const legacyId = recipe.recipe.legacy_id;
            const category = recipe.qa_metadata?.category || "N/A";
            const score = recipe.qa_metadata?.internal_score?.marketing_joy_score || "N/A";

            console.log(`\n✅ [ID: ${legacyId}] ${recipe.title}`);
            console.log(`   - Category: ${category}`);
            console.log(`   - Joy Score: ${score}`);
            console.log(`   - Link: http://localhost:3000/recipe/${legacyId}?lang=en`);
        }
    }
}

verifyRandomBatch();
