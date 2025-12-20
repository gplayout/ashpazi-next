
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyRestoredSamples() {
    // 1. Find Restored Legacy (English)
    const { data: translations, error } = await client
        .from('content_translations')
        .select('recipe_id, title')
        .eq('qa_metadata->>category', 'Restored Legacy')
        .eq('language_code', 'en');

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (!translations || translations.length === 0) {
        console.log("No 'Restored Legacy' found (try checking without language filter?)");
        return;
    }

    // 2. Shuffle and Pick 3
    const shuffled = translations.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    console.log("\n🖼️  3 Random Restored Recipes (Check Images):\n");

    // We can also check if German exists for these
    for (const r of selected) {
        const { data: de } = await client
            .from('content_translations')
            .select('recipe_id')
            .eq('recipe_id', r.recipe_id)
            .eq('language_code', 'de')
            .single();

        const lang = de ? 'de' : 'en';
        console.log(`- **${r.title}**`);
        console.log(`  [http://localhost:3000/recipe/${r.recipe_id}?lang=${lang}](http://localhost:3000/recipe/${r.recipe_id}?lang=${lang})`);
    }
}

verifyRestoredSamples();
