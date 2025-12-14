
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function retryUpdate() {
    const ID = 251; // One of the failed ones
    console.log(`🔄 Retrying Update for ID ${ID} (Split Strategy)...`);

    // 1. Update ONLY nutrition_info (JSONB)
    // We'll just put a dummy value to test
    const dummyData = { en: { test: "check" } };

    console.log("Step 1: Updating nutrition_info...");
    const { error: e1 } = await supabase
        .from('recipes')
        .update({ nutrition_info: dummyData })
        .eq('id', ID);

    if (e1) {
        console.error("❌ Step 1 Failed:", e1);
        return;
    }
    console.log("✅ Step 1 Success.");

    // 2. Update ONLY description (Text)
    console.log("Step 2: Updating description...");
    const { error: e2 } = await supabase
        .from('recipes')
        .update({ description: "Test Description Update" })
        .eq('id', ID);

    if (e2) {
        console.error("❌ Step 2 Failed:", e2);
    } else {
        console.log("✅ Step 2 Success.");
        console.log("🎉 SPLIT STRATEGY WORKS! The Schema Cache issue is bypassed.");
    }
}

retryUpdate();
