
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUrls() {
    console.log("Checking URLs and Names...");

    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name, name_en, image')
        .not('image', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Fetch Error:", error);
        return;
    }

    recipes.forEach(r => {
        console.log(`[${r.id}] Name: ${r.name} | Image: ${r.image.substring(0, 50)}...`);
        if (!r.image.startsWith('http')) {
            console.warn(`⚠️ WARNING: Invalid URL for ID ${r.id}: ${r.image}`);
        }
        if (!r.name && !r.name_en) {
            console.warn(`⚠️ WARNING: Missing Name for ID ${r.id}`);
        }
    });

    // Check recipe_translations relation
    const { data: translationJoin, error: joinErr } = await supabase
        .from('recipes')
        .select('id, recipe_translations(id, language_code)')
        .limit(1);

    if (joinErr) {
        console.error("⚠️ Relation 'recipe_translations' Error:", joinErr.message);
    } else {
        console.log("Relation 'recipe_translations' seems OK.");
    }
}

checkUrls();
