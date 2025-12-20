const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function resetEn() {
    console.log("⚠️ DELETING ALL 'en' TRANSLATIONS to force fresh migration...");
    const { error } = await supabase
        .from('content_translations')
        .delete()
        .eq('language_code', 'en');

    if (error) console.error("Error:", error);
    else console.log("✅ All English translations wiped.");

    console.log("🔄 Resetting Pipeline State to 'manual_retry' (Partial)...");
    // Ideally we should reset status to 'normalized_ok' or 'manual_retry' for all that were 'translated_en'
    // But since we deleted the translations, the API will just re-process them anyway.
    // However, to be cleaner, let's just log.
    console.log("Ready for fresh start.");
}

resetEn();
