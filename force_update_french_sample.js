
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const API_URL = 'http://localhost:3000/api/pipeline/translate';
const SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';

async function forceUpdateSamples() {
    console.log("⚡ FORCE UPDATING SAMPLES 746 & 1492 (French V2)...");

    const ids = [746, 1492];

    for (const id of ids) {
        console.log(`\n--- Processing ID ${id} ---`);

        // 1. Force State to manual_retry
        const { error } = await client
            .from('recipe_pipeline_state')
            .upsert({
                legacy_recipe_id: id,
                status: 'manual_retry',
                last_processed_at: null
            }, { onConflict: 'legacy_recipe_id' });

        if (error) { console.error("State Error:", error); continue; }

        // 2. Call API Specific
        // URL: ...?secret=...&lang=fr&id=746
        const res = await fetch(`${API_URL}?secret=${SECRET}&lang=fr&id=${id}`);
        const json = await res.json();

        console.log("API Response:", JSON.stringify(json.summary || json, null, 2));
    }

    console.log("\n✅ Force Update Complete.");
}

forceUpdateSamples();
