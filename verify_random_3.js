require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkIds(ids) {
    console.log(`🔎 Verifying Candidates: ${ids.join(', ')}`);

    for (const id of ids) {
        console.log(`\n---------------------------------`);
        console.log(`🆔 Checking Recipe ID: ${id}`);

        // 1. Get Registry
        const { data: registry } = await supabase
            .from('registry_recipes')
            .select('id')
            .eq('legacy_recipe_id', id)
            .single();

        if (!registry) {
            console.log(`❌ Registry NOT found for ${id}`);
            continue;
        }

        // 2. Pipeline State
        const { data: state } = await supabase
            .from('recipe_pipeline_state')
            .select('status, last_processed_at')
            .eq('legacy_recipe_id', id)
            .single();
        console.log(`📊 State: ${state?.status} (Last: ${state?.last_processed_at})`);

        // 3. Legacy Column Check
        const { data: legacy } = await supabase
            .from('recipes')
            .select('category')
            .eq('id', id)
            .single();

        console.log(`✅ Legacy DB Category: "${legacy.category}"`);

        if (legacy.category && /[\u0600-\u06FF]/.test(legacy.category)) {
            console.log(`⚠️  FAIL: FARSI DETECTED!`);
        } else {
            console.log(`✅ PASS: English Only.`);
        }
    }
}

checkIds([147]);
