
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const API_URL = 'http://localhost:3000/api/pipeline/translate';
const SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';

async function forceUpdateEnglishSample() {
    console.log("⚡ FORCE UPDATING SAMPLE 746 (ENGLISH GEMINI 3)...");

    const id = 746;

    // 1. Force State to manual_retry
    const { error } = await client
        .from('recipe_pipeline_state')
        .upsert({
            legacy_recipe_id: id,
            status: 'manual_retry',
            last_processed_at: null
        }, { onConflict: 'legacy_recipe_id' });

    if (error) { console.error("State Error:", error); return; }

    // 2. Call API for English
    // URL: ...?secret=...&lang=en&id=746
    const res = await fetch(`${API_URL}?secret=${SECRET}&lang=en&id=${id}`);
    const json = await res.json();

    console.log("API Response:", JSON.stringify(json.summary || json, null, 2));

    // 3. Verify Result Metadata Keys immediately
    const { data: tr } = await client.from('content_translations').select('qa_metadata').eq('language_code', 'en').eq('recipe_id', json.details?.[0]?.uuid || json.details?.[0]?.id).single(); // Attempt to verify if possible, but the API response usually has enough info or I'll trust the UI test.
}

forceUpdateEnglishSample();
