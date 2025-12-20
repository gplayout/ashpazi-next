
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findGermanBatch() {
    const { data: translations, error } = await client
        .from('content_translations')
        .select('recipe_id, title')
        .eq('language_code', 'de')
        .eq('publish_status', 'published')
        .limit(20); // Fetch a few to pick random ones

    if (error) {
        console.error("Error:", error);
        return;
    }

    // Shuffle and pick 5
    const shuffled = translations.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    console.log("🇩🇪 5 New German Recipes for Testing:\n");
    selected.forEach((t, i) => {
        console.log(`${i + 1}. ${t.title}`);
        console.log(`   http://localhost:3000/recipe/${t.recipe_id}?lang=de\n`);
    });
}

findGermanBatch();
