
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFrench() {
    console.log("=== FRENCH STATUS CHECK ===");

    // 1. Total Count
    const { count, error } = await supabase
        .from('content_translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'fr');

    if (error) { console.error(error); return; }

    console.log(`🇫🇷 French Translations Count: ${count}`);

    // 2. Sample Quality
    const { data: samples } = await supabase
        .from('content_translations')
        .select('title, description, qa_metadata')
        .eq('language_code', 'fr')
        .limit(5);

    if (samples && samples.length > 0) {
        samples.forEach((s, i) => {
            console.log(`\n--- Sample ${i + 1} ---`);
            console.log("Title:", s.title);
            const desc = s.qa_metadata?.marketing_description || s.description;
            console.log("Desc Start:", desc ? desc.substring(0, 50) + "..." : "EMPTY");
            console.log("Rich?", (desc && desc.toUpperCase() === desc) ? "YES (Caps)" : "NO (Likely Legacy)");
        });
    } else {
        console.log("No French samples found.");
    }
}

checkFrench();
