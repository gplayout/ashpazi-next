
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyLatest() {
    // Fetch random pool of German recipes
    const { data: allDe, error } = await client
        .from('content_translations')
        .select('recipe_id, title')
        .eq('language_code', 'de')
        .limit(100);

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    if (!allDe || allDe.length === 0) {
        console.log("No German translations found.");
        return;
    }

    // Shuffle and pick 3
    const shuffled = allDe.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    console.log("\n🇩🇪 3 Random German Recipes:\n");
    selected.forEach((r, i) => {
        console.log(`${i + 1}. **${r.title}**`);
        console.log(`   [http://localhost:3000/recipe/${r.recipe_id}?lang=de](http://localhost:3000/recipe/${r.recipe_id}?lang=de)\n`);
    });
}

verifyLatest();
