
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkContent() {
    const targetUUID = '93e183ab-cf84-42f7-b98e-090836cb5269'; // Salad Shirazi
    console.log(`🔍 Checking Content for UUID: ${targetUUID}`);

    const { data: trans, error } = await supabase
        .from('content_translations')
        .select('*')
        .eq('recipe_id', targetUUID)
        .eq('language_code', 'en')
        .single();

    if (error) {
        console.error("❌ Error fetching translation:", error.message);
        return;
    }

    if (trans) {
        console.log("✅ Translation Found!");
        console.log("   Title:", trans.title);
        console.log("   Instruction Steps:", trans.instructions?.length);
        console.log("   QA Metadata Keys:", Object.keys(trans.qa_metadata || {}));

        const rich = trans.qa_metadata;
        console.log("   - Origin History:", rich?.origin_history ? (rich.origin_history.substring(0, 50) + '...') : 'MISSING');
        console.log("   - Chef Guide:", rich?.chef_guide ? 'YES' : 'MISSING');
        console.log("   - Flavor Profile:", rich?.flavor_profile ? 'YES' : 'MISSING');
    } else {
        console.log("⚠️ No translation found for this UUID yet.");
    }
}

checkContent();
