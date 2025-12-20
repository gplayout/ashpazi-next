const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findByUserTitle() {
    const title = "Premium Cantonese-Style Egg Fried Rice with Jasmine Rice";
    console.log(`Searching for exact title: "${title}"...`);

    // Exact match trial
    let { data, error } = await supabase
        .from('content_translations')
        .select('recipe_id, title, ingredients')
        .eq('title', title);

    if (data && data.length > 0) {
        console.log("✅ FOUND EXACT MATCH!");
        console.log(JSON.stringify(data, null, 2));
        return;
    }

    console.log("No exact match. Trying fuzzy ILIKE...");
    // Fuzzy match
    const { data: fuzzy } = await supabase
        .from('content_translations')
        .select('recipe_id, title, ingredients')
        .ilike('title', '%Cantonese-Style Egg Fried Rice%');

    if (fuzzy && fuzzy.length > 0) {
        console.log(`✅ Found ${fuzzy.length} fuzzy matches:`);
        fuzzy.forEach(f => console.log(`[${f.recipe_id}] ${f.title}`));
    } else {
        console.log("❌ No matches found.");
    }
}

findByUserTitle();
