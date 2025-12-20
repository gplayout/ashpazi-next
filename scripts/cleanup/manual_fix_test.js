require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { TranslationAgent } = require('./src/lib/pipeline/translation-agent');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAndRegenerate() {
    console.log("🛠️  MANUAL FIX KICKOFF for ID 1111 (Ghormeh Sabzi)...\n");

    // 1. Reset Pipeline Status
    console.log("1️⃣  Resetting Pipeline Status...");
    const { error: resetErr } = await supabase
        .from('recipe_pipeline_state')
        .update({ status: 'manual_retry' })
        .eq('legacy_recipe_id', 1111);

    if (resetErr) {
        console.error("❌ Reset Failed:", resetErr);
        return;
    }
    console.log("   ✅ Status set to 'manual_retry'");

    // 2. Fetch Data for Translation
    console.log("\n2️⃣  Fetching Source Data...");
    const { data: recipe } = await supabase.from('recipes').select('*').eq('id', 1111).single();
    const { data: reg } = await supabase.from('registry_recipes').select('id').eq('legacy_recipe_id', 1111).single();

    if (!recipe || !reg) {
        console.error("❌ Data missing");
        return;
    }

    // 3. Generate Translation
    console.log("\n3️⃣  Running Translation Agent (Gemini)...");
    const input = {
        recipe_id: reg.id,
        source_title: recipe.name,
        source_instructions: recipe.instructions,
        ingredients_context: recipe.ingredients,
        targetLanguage: 'en'
    };

    try {
        const translation = await TranslationAgent.translate(input);
        console.log("   ✅ Translation Generated:", translation.title);

        // 4. Save to DB
        console.log("\n4️⃣  Saving to DB...");
        const { error: saveErr } = await supabase
            .from('content_translations')
            .upsert({
                recipe_id: reg.id,
                language_code: 'en',
                title: translation.title,
                instructions: translation.instructions,
                ingredients: translation.ingredients,
                qa_metadata: {
                    ...translation.internal_score,
                    marketing_description: translation.marketing_description,
                    origin_history: translation.origin_history,
                    sensory_experience: translation.sensory_experience,
                    dietary_tags: translation.dietary_tags,
                    // ... minimal set for test
                },
                publish_status: 'published',
                version: 2
            }, { onConflict: 'recipe_id, language_code' });

        if (saveErr) console.error("❌ Save Failed:", saveErr);
        else console.log("   ✅ Saved 'published' translation.");

    } catch (e) {
        console.error("❌ Agent Error:", e);
    }
}

fixAndRegenerate();
