require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getLinks() {
    // Fetch latest 10 translations
    const { data: translations, error } = await supabase
        .from('content_translations')
        .select('recipe_id')
        .eq('language_code', 'en')
        .order('last_updated', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching translations:', error);
        return;
    }

    // Map UUIDs to Legacy IDs
    const links = [];
    for (const t of translations) {
        const { data: registry } = await supabase
            .from('registry_recipes')
            .select('legacy_recipe_id')
            .eq('id', t.recipe_id)
            .single();

        if (registry && registry.legacy_recipe_id) {
            links.push(`http://localhost:3000/recipe/${registry.legacy_recipe_id}`);
        }
    }

    console.log('Latest Verify Links:');
    links.forEach((l, i) => console.log(`${i + 1}. ${l}`));
}

getLinks();
