
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyRandomGerman() {
    // Get a larger batch to pick randomly from
    const { data: translations, error } = await client
        .from('content_translations')
        .select('recipe_id, title')
        .eq('language_code', 'de')
        .eq('publish_status', 'published')
        .limit(100);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (!translations || translations.length === 0) {
        console.log("No translations found.");
        return;
    }

    // Shuffle
    const shuffled = translations.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    console.log("🇩🇪 3 Random German Recipes for Verification:\n");
    selected.forEach((t, i) => {
        console.log(`${i + 1}. ${t.title}`);
        console.log(`   http://localhost:3000/recipe/${t.recipe_id}?lang=de\n`);
    });
}

verifyRandomGerman();
