
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function compareVersions() {
    const targetId = 1475; // Peking Duck (Confirmed in logs)
    console.log(`🕵️ COMPARING OLD VS NEW FOR ID: ${targetId}`);

    const { data: r, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', targetId)
        .single();

    if (error) {
        console.error("❌ Error:", error);
        return;
    }

    console.log(`\n----------------------------------------`);
    console.log(`📝 CURRENT DB COLUMN (What users see if sync worked):`);
    console.log(`----------------------------------------`);
    console.log(r.description || "(NULL)");

    console.log(`\n----------------------------------------`);
    console.log(`🤖 AI GENERATED CONTENT (Hidden in JSON):`);
    console.log(`----------------------------------------`);

    if (r.nutrition_info) {
        console.log("🇬🇧 ENGLISH (from JSON):");
        console.log(r.nutrition_info.en?.description || r.nutrition_info.english?.description || "(No English Description in JSON)");

        console.log("\n🇮🇷 PERSIAN (from JSON):");
        console.log(r.nutrition_info.fa?.description || r.nutrition_info.persian?.description || "(No Persian Description in JSON)");

        console.log("\n🧪 EXTRAS:");
        console.log("Chef Notes (English):", r.nutrition_info.en?.chef_notes);
        console.log("Health Benefits:", r.nutrition_info.en?.health_benefits);
    } else {
        console.log("❌ No nutrition_info JSON found!");
    }
}

compareVersions();
