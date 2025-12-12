const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Key Type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE (Good)' : 'ANON (Risk of RLS block)');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Env Vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWrite() {
    console.log('Attempting to fetch a recipe...');
    const { data, error } = await supabase
        .from('recipes')
        .select('id, name, nutrition_info')
        .limit(1);

    if (error) {
        console.error('Read Error:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No recipes found to test.');
        return;
    }

    const recipe = data[0];
    console.log(`Testing write on Recipe: "${recipe.name}" (ID: ${recipe.id})`);

    // Attempt to update nutrition_info with a test timestamp
    const testData = { ...recipe.nutrition_info, _test_timestamp: new Date().toISOString() };

    const { error: updateError } = await supabase
        .from('recipes')
        .update({ nutrition_info: testData })
        .eq('id', recipe.id);

    if (updateError) {
        console.error('❌ WRITE FAILED:', updateError.message);
        console.error('Reason: Likely RLS policy blocking Anon key, or missing SERVICE_ROLE key.');
    } else {
        console.log('✅ WRITE SUCCESS! Database is writable.');
    }
}

testWrite();
