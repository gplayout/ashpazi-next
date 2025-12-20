const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findCanton() {
    console.log("Searching translations for 'Cantonese' (Global)...");
    const { data, error } = await supabase
        .from('content_translations')
        .select('recipe_id, title')
        .ilike('title', '%Cantonese%');

    if (data && data.length > 0) {
        console.log("✅ FOUND IN TITLE!");
        data.forEach(d => console.log(`[${d.recipe_id}] ${d.title}`));
    } else {
        console.log("❌ Not in title.");
    }

    // Body search
    const { data: body } = await supabase
        .from('content_translations')
        .select('recipe_id, title')
        .textSearch('qa_metadata', `'Cantonese'`, { config: 'english' }); // Simple FTS trial
    // FTS might fail if index missing. Fallback to limit scan.

    console.log("Scanning body (5000 limit)...");
    const { data: all } = await supabase.from('content_translations').select('recipe_id, title, qa_metadata, instructions').eq('language_code', 'en').limit(5000);

    const matches = all.filter(r => {
        const t = JSON.stringify(r);
        return t.toLowerCase().includes('cantonese');
    });

    if (matches.length > 0) {
        console.log(`✅ Found ${matches.length} body matches:`);
        matches.forEach(m => console.log(`[${m.recipe_id}] ${m.title}`));
    } else {
        console.log("❌ Globally absent.");
    }
}
findCanton();
