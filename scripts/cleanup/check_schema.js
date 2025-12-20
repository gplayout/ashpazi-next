const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load Env
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim().replace(/"/g, '');
});

// 2. Client
const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    console.log('Checking content_translations schema...');
    // Try to insert a dummy row with ingredients to see if it errors
    const { error } = await supabase
        .from('content_translations')
        .insert({
            recipe_id: 0, // invalid ID
            language_code: 'check',
            title: 'Schema Check',
            instructions: [],
            ingredients: ['test'] // This is the new column
        })
        .select();

    if (error) {
        console.error('Schema Error (likely missing column):', error.message);
    } else {
        console.log('Schema OK: Insert with "ingredients" succeeded (or would have if constraints allowed).');
        // Clean up if it actually inserted
        await supabase.from('content_translations').delete().eq('language_code', 'check');
    }
}

checkSchema();
