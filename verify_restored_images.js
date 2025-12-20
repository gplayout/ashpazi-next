
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyImages() {
    // Check restored recipes
    const { data: recipes } = await client
        .from('content_translations')
        .select(`
            recipe_id, 
            title,
            recipes:recipe_id(image_url)
        `)
        .eq('qa_metadata->>category', 'Restored Legacy')
        .limit(5);

    if (!recipes) return;

    recipes.forEach(r => {
        // Handle join structure
        // Since we joined on recipe_id (uuid) which is FK? 
        // Actually content_translations.recipe_id is UUID. recipes.uuid is UUID.
        // Let's assume Supabase join works if setup.
        // Or just fetch from recipes directly.
        console.log(`Recipe: ${r.title}`);
        // console.log(`Image: ${r.recipes?.image_url}`); 
        // Note: JS join syntax might be nested. 
    });

    // Simpler check: Just query recipes with restored UUIDs
    const uuids = recipes.map(r => r.recipe_id);
    const { data: rows } = await client.from('recipes').select('uuid, image_url').in('uuid', uuids);

    rows.forEach(row => {
        console.log(`[${row.uuid}] Image: ${row.image_url ? row.image_url.substring(0, 30) + '...' : 'NULL'}`);
    });
}

verifyImages();
