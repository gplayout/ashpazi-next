
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTranslation() {
    console.log('Resolving UUID for Legacy ID 1541...');

    // 1. Get UUID
    const { data: reg, error: regError } = await supabase
        .from('registry_recipes')
        .select('id')
        .eq('legacy_recipe_id', 1541)
        .single();

    if (regError || !reg) {
        console.error('Registry Lookup Error or Not Found:', regError);
        return;
    }
    const uuid = reg.id;
    console.log('Found UUID:', uuid);

    // 2. Get Translation
    console.log('Checking Translation (EN)...');
    const { data, error } = await supabase
        .from('content_translations')
        .select('*') // select all to check structure
        .eq('recipe_id', uuid)
        .eq('language_code', 'en')
        .single();

    if (error) {
        console.error('Error fetching translation:', error);
    } else {
        console.log('Translation Found:');
        console.log('Title:', data.title);

        // Check key fields
        console.log('HAS Ingredients Array?', Array.isArray(data.ingredients));
        console.log('Ingredients Length:', data.ingredients?.length);
        console.log('Sample Ingredient:', data.ingredients?.[0]);
    }
}

checkTranslation();
