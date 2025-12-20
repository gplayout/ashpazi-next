
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findRecent() {
    console.log("Fetching last 25 recipes...");
    const { data: recipes, error } = await client
        .from('recipes')
        .select('id, uuid, image_url, created_at')
        .order('id', { ascending: false }) // Assuming ID increments, or Created At
        .limit(25);

    if (error) console.error(error);

    // Also fetch their titles from registry or translations
    for (const r of recipes || []) {
        const { data: t } = await client
            .from('content_translations')
            .select('title')
            .eq('recipe_id', r.uuid)
            .eq('language_code', 'en') // Check English title
            .single();

        console.log(`[${r.id}] ${t?.title || 'No Title'} (Img: ${r.image_url ? 'Yes' : 'NULL'})`);
    }
}

findRecent();
