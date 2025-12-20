require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectSchema() {
    console.log('Inspecting Schema...');

    // Check recipes columns by selecting one row
    const { data: recipes, error: rError } = await supabase
        .from('recipes')
        .select('*')
        .limit(1);

    if (rError) console.error('Recipes Error:', rError);
    else if (recipes.length > 0) console.log('Recipes Keys:', Object.keys(recipes[0]));
    else console.log('Recipes table empty or no access');

    // Check content_translations columns
    const { data: translations, error: tError } = await supabase
        .from('content_translations')
        .select('*')
        .limit(1);

    if (tError) console.error('Translations Error:', tError);
    else if (translations.length > 0) console.log('Translations Keys:', Object.keys(translations[0]));
    else console.log('Translations table empty or no access');
}

inspectSchema();
