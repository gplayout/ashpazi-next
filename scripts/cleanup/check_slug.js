
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecipe() {
    console.log('Checking recipe 1541...');

    // Check main recipes table
    const { data: recipe, error } = await supabase
        .from('recipes')
        .select('id, title, slug')
        .eq('id', 1541)
        .single();

    if (error) {
        console.error('Error fetching recipe:', error);
    } else {
        console.log('Legacy Recipe:', recipe);
    }

    // Check content_translations
    const { data: translation, error: transError } = await supabase
        .from('content_translations')
        .select('*')
        .eq('recipe_id', 1541)
        .eq('language_code', 'en');

    if (transError) {
        console.error('Error fetching translations:', transError);
    } else {
        console.log('Translations found:', translation.map(t => ({ id: t.id, slug: t.slug, title: t.title })));
    }
}

checkRecipe();
