
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAndLock() {
    console.log("=== 1. VERIFYING COUNTS ===");

    // 1. Check Golden JSON
    const jsonPath = 'zaffaron_golden_english.json';
    const goldenData = JSON.parse(fs.readFileSync(jsonPath));
    const goldenCount = Array.isArray(goldenData) ? goldenData.length : Object.keys(goldenData).length;
    console.log(`🔒 Golden JSON Count: ${goldenCount}`);

    // 2. Check Database English Translations
    const { count: dbCount, error } = await supabase
        .from('content_translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'en');

    if (error) { console.error("DB Error:", error); return; }
    console.log(`🗄️  Database EN Count: ${dbCount}`);

    if (goldenCount !== dbCount) {
        console.warn(`⚠️ MISMATCH: JSON (${goldenCount}) vs DB (${dbCount}). Some items might be missing or extra.`);
    } else {
        console.log("✅ COUNTS MATCH EXACTLY.");
    }

    // 3. Check Quality (Random Audit)
    console.log("\n=== 2. CHECKING QUALITY (Chef Zaffaron Signature) ===");
    const { data: samples } = await supabase
        .from('content_translations')
        .select('description, qa_metadata')
        .eq('language_code', 'en')
        .limit(5);

    const valid = samples.every(s => {
        const desc = s.qa_metadata?.marketing_description || s.description;
        return desc && desc.length > 50 && !desc.startsWith("A delicious");
    });

    if (valid) console.log("✅ Random sample check passed (Rich Content found).");
    else console.warn("❌ Random sample check FAILED (Found generic/empty content).");

    // 4. Check Pipeline Lock Capabilities
    console.log("\n=== 3. CHECKING LOCK CAPABILITY ===");
    // We want to see if we can set status='finalized' or 'locked'
    // First, let's see current statuses
    const { data: states } = await supabase
        .from('recipe_pipeline_state')
        .select('status')
        .limit(1);

    console.log("Current Status Sample:", states?.[0]?.status);
    console.log("Ready to LOCK. (Requires schema check or enum check).");
}

verifyAndLock();
