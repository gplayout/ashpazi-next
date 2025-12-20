
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findGerman() {
    console.log("🔍 Searching for German (de) translations...");

    const { data: trans, error } = await supabase
        .from('content_translations')
        .select(`
            recipe_id,
            title
        `)
        .eq('language_code', 'de')
        .limit(5);

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log(`✅ Found ${trans.length} German recipes.`);
        trans.forEach((t, i) => {
            console.log(`\n${i + 1}. [${t.title}]`);
            console.log(`   ID: ${t.recipe_id}`);
            console.log(`   Link: http://localhost:3000/recipe/${t.recipe_id}?lang=de`);
        });
    }
}

findGerman();
