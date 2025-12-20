const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const RECIPE_ID = 1541; // User requested target

async function testFix() {
    console.log(`🧪 Testing Fix on Recipe ${RECIPE_ID}...`);

    // 1. Reset state for this recipe just in case
    await supabase.from('content_translations').delete().eq('registry_recipes.legacy_recipe_id', RECIPE_ID); // pseudo-join doesn't work in delete usually

    // Manual delete via registry lookup
    const { data: reg } = await supabase.from('registry_recipes').select('id').eq('legacy_recipe_id', RECIPE_ID).single();
    if (reg) {
        await supabase.from('content_translations').delete().eq('recipe_id', reg.id).eq('language_code', 'en');
        await supabase.from('recipe_pipeline_state').update({ status: 'manual_retry' }).eq('legacy_recipe_id', RECIPE_ID);
        console.log("Reset done.");
    }

    // 2. Call Translation API specifically for this one (we need to hack the offset or just rely on 'manual_retry' pickup)
    // The API picks up based on status. If I set it to 'manual_retry', any batch run will pick it up.
    // I need to make sure the API logic actually selects 'manual_retry'.

    // Actually, let's call the Translate Agent DIRECTLY to skip queue logic and just test the INPUT construction.
    // Wait, the bug was in the ROUTE.JS input construction. So I MUST call the route.

    // I'll use the 'trigger_batch_test.js' logic but I need it to pick THIS recipe.
    // The route selects by: .in('status', ['new', 'manual_retry'])

    // So if I set this one to 'manual_retry' and everything else is 'translated', it should pick this one.
    // But currently 1100 are 'published'.

    console.log("Triggering API...");
    const secret = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';
    const res = await fetch(`http://localhost:3000/api/pipeline/translate?secret=${secret}&lang=en&offset=0`);
    const json = await res.json();

    console.log("API Result:", JSON.stringify(json, null, 2));

    // 3. Check the result in DB
    if (reg) {
        const { data: trans } = await supabase.from('content_translations').select('ingredients').eq('recipe_id', reg.id).eq('language_code', 'en').single();
        console.log("\n---- FINAL INGREDIENTS ----");
        console.log(trans?.ingredients);
    }
}
testFix();
