
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const legacyId = 1541;
    console.log(`Checking Legacy ID: ${legacyId}`);

    // 1. Check Legacy Recipe
    const { data: legacy, error: legErr } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', legacyId)
        .single();

    if (legErr) console.error('Legacy Error:', legErr.message);
    else console.log('Legacy Recipe:', {
        id: legacy.id,
        name: legacy.name,
        name_en: legacy.name_en,
        slug_guess: legacy.name_en?.replace(/\s+/g, '-')
    });

    // 2. Check Registry
    const { data: reg, error: regErr } = await supabase
        .from('registry_recipes')
        .select('id')
        .eq('legacy_recipe_id', legacyId)
        .single();

    if (regErr) console.error('Registry Error:', regErr.message);
    else {
        console.log('Registry UUID:', reg.id);

        // 3. Check Translations
        const { data: trans, error: transErr } = await supabase
            .from('content_translations')
            .select('*')
            .eq('recipe_id', reg.id);

        if (transErr) console.error('Translation Error:', transErr.message);
        else {
            console.log('Translations Found:', trans.length);
            trans.forEach(t => {
                console.log(`- [${t.language_code}] Status: ${t.publish_status}`);
                console.log(`  Title: "${t.title}"`);
                console.log(`  Slug Guess: "${t.title?.replace(/\s+/g, '-')}"`);
                // Also check ingredients length
                console.log(`  Ingredients Len: ${t.ingredients?.length}`);
            });
        }
    }
}

check();
