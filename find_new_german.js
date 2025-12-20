
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findNewGerman() {
    // Fetch recently updated German translations
    const { data: translations, error } = await client
        .from('content_translations')
        .select('recipe_id, title, last_updated')
        .eq('language_code', 'de')
        .eq('publish_status', 'published')
        .order('last_updated', { ascending: false }) // Newest first
        .limit(5);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (!translations || translations.length === 0) {
        console.log("No new German translations found yet.");
        return;
    }

    console.log("🇩🇪 Newly Generated German Recipes (Turbo Batch):\n");
    translations.forEach((t, i) => {
        console.log(`${i + 1}. ${t.title}`);
        console.log(`   http://localhost:3000/recipe/${t.recipe_id}?lang=de`);
        console.log(`   (Updated: ${t.last_updated})\n`);
    });
}

findNewGerman();
