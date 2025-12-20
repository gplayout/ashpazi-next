
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeCategories() {
    // Fetch all German translations
    const { data: rows, error } = await client
        .from('content_translations')
        .select('qa_metadata')
        .eq('language_code', 'de');

    if (error || !rows) {
        console.error("Error fetching data:", error);
        return;
    }

    const categories = new Set();
    rows.forEach(r => {
        const cat = r.qa_metadata?.category;
        if (cat) categories.add(cat);
    });

    console.log("📊 Unique Categories Found in DB (German Set):");
    console.log([...categories].sort());
}

analyzeCategories();
