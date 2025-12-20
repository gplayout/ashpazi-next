
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fix1600() {
    // 1. Get recipe 1600
    const { data: recipe } = await client
        .from('recipes')
        .select('*')
        .eq('id', 1600)
        .single();

    console.log(`Recipe 1600 Name: ${recipe.name}`);

    // 2. We need to find the UUID. 
    // IF 'recipes' table doesn't have UUID column, then maybe the UUID is stored in 'auth' or somewhere else?
    // OR maybe there is a 'uuid' column but I just can't see it?
    // Wait, the error "column recipes.uuid does not exist" is definitive.

    // BUT translations have UUIDs. Where do they link to?
    // Maybe `content_translations.recipe_id` DOES NOT link to `recipes.id` (int). 
    // It links to a UUID that... USED to exist? or exists in another table?

    // Hypothesis: The migrations added UUIDs to recipes but maybe recipe 1600 is new and didn't get one?
    // OR older recipes have UUIDs hidden? 
    // NO, the column itself is missing.

    // This implies that `content_translations` is using a UUID as a key, but `recipes` is using an Integer ID.
    // HOW ARE THEY JOINED?

    // Let's search `content_translations` by TITLE to find the orphan translation for "Nargesi".
    const { data: trans } = await client
        .from('content_translations')
        .select('*')
        .ilike('title', '%Nargesi%');

    if (trans && trans.length > 0) {
        console.log(`Found ${trans.length} translations matching "Nargesi":`);
        trans.forEach(t => {
            console.log(`- Recipe UUID in Translation: ${t.recipe_id}`);
            console.log(`- Title: ${t.title}`);
        });

        // If we find one, we know what UUID it EXPECTS.
        // But since `recipes` table relies on ID=1600, there is a disconnect.

        // The App URL is /recipe/nargesi...?id=1600
        // The App probably tries to look up by ID 1600.
        // If the App code expects content_translations to be joined, it might fail if there is no link.

    } else {
        console.log("No translations found for Nargesi.");
    }
}

fix1600();
