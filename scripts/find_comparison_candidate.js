
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findCandidate() {
    console.log("🕵️ Looking for a recipe with 'original_text'...");

    // Find any recipe with non-null original_text AND non-null nutrition_info
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name_en, original_text, nutrition_info')
        .not('original_text', 'is', null) // Must have old text
        .not('nutrition_info', 'is', null) // Must have new text
        .limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (!recipes || recipes.length === 0) {
        console.log("❌ No suitable candidate found (original_text might be empty for all).");
        return;
    }

    const r = recipes[0];
    console.log(`\n✅ FOUND CANDIDATE: ID ${r.id} (${r.name_en})`);

    console.log(`\n📜 [OLD] ORIGINAL TEXT (First 300 chars):`);
    console.log(r.original_text.slice(0, 300).replace(/\n/g, ' '));

    console.log(`\n✨ [NEW] AI DESCRIPTION:`);
    console.log(r.nutrition_info.en?.description || r.nutrition_info.english?.description);

    console.log(`\n✨ [NEW] CHEF NOTES:`);
    const notes = r.nutrition_info.en?.chef_notes || r.nutrition_info.english?.chef_notes;
    console.log(notes || "None");
}

findCandidate();
