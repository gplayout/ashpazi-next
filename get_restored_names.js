
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getRestoredNames() {
    // ids I found: 1410, 525, 806
    const { data: recipes, error } = await client
        .from('recipes')
        .select('id, name, name_en, image')
        .in('id', [1410, 525, 806]);

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("🖼️  3 Verified Recipes with New Images:\n");
    recipes.forEach((r, i) => {
        const title = r.name_en || r.name || 'Untitled';
        console.log(`${i + 1}. ${title}`);
        console.log(`   http://localhost:3000/recipe/${r.id}?lang=de`);
        // console.log(`   (Image: ${r.image})`);
        console.log("");
    });
}

getRestoredNames();
