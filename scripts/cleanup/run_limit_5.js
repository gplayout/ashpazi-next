
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TARGET_IDS = [1540, 1541, 1542, 800, 120];

async function runBatch5() {
    console.log("🔥 RESETTING & PROCESSING 5 RECIPES FROM START...");

    // 1. Reset Status for these 5
    for (const legacyId of TARGET_IDS) {
        console.log(`   - Resetting ID ${legacyId}...`);

        // Find UUID
        const { data: reg } = await supabase.from('registry_recipes').select('id').eq('legacy_recipe_id', legacyId).single();
        if (!reg) continue;

        // Delete Translation
        await supabase.from('content_translations').delete().eq('recipe_id', reg.id).eq('language_code', 'en');

        // Set Pipeline State
        await supabase.from('recipe_pipeline_state').upsert({
            legacy_recipe_id: legacyId,
            status: 'manual_retry'
        });
    }

    console.log("🚀 Triggering API Translation Queue...");

    // Call API with offset=0, it prioritizes manual_retry
    const url = `http://localhost:3000/api/pipeline/translate?secret=pipeline_secret_777&lang=en&offset=0`;
    const res = await fetch(url);
    const data = await res.json();

    console.log("\n✅ RESULT:", JSON.stringify(data.summary, null, 2));

    console.log("\n🔗 VERIFICATION LINKS:");
    if (data.summary.details) {
        data.summary.details.forEach(d => {
            console.log(`👉 http://localhost:3000/recipe/${d.id}`);
        });
    }
}

runBatch5();
