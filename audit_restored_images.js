
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function auditRestored() {
    // 1. Get all Restored Legacy
    const { data: translations } = await client
        .from('content_translations')
        .select('recipe_id, title')
        .eq('qa_metadata->>category', 'Restored Legacy');

    if (!translations || translations.length === 0) {
        console.log("No Restored Legacy recipes found in Translations.");
        return;
    }

    const uuids = translations.map(t => t.recipe_id);

    // 2. Check their image_url in recipes table
    const { data: recipes } = await client
        .from('recipes')
        .select('uuid, image_url')
        .in('uuid', uuids);

    let hasImage = 0;
    let missingImage = 0;

    console.log(`\n🔎 Audit of ${uuids.length} Restored Recipes:`);

    recipes.forEach(r => {
        const t = translations.find(tr => tr.recipe_id === r.uuid);
        const ok = r.image_url && !r.image_url.includes('placeholder') && r.image_url.startsWith('http');

        if (ok) hasImage++;
        else missingImage++;

        console.log(`- ${t.title.substring(0, 30)}... : ${ok ? '✅ Image OK' : '❌ MISSING'}`);
    });

    console.log(`\n📊 Summary:`);
    console.log(`- Total: ${uuids.length}`);
    console.log(`- With Image: ${hasImage}`);
    console.log(`- Missing: ${missingImage}`);
}

auditRestored();
