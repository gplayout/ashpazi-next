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

async function check() {
    console.log('Checking latest translation for ingredients...');

    const { data, error } = await supabase
        .from('content_translations')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.log("No translations found yet.");
        return;
    }

    console.log(`\nRecipe: ${data.title} (${data.language_code})`);
    console.log('--- Ingredients ---');
    if (data.ingredients && data.ingredients.length > 0) {
        data.ingredients.forEach(ing => console.log(`- ${ing}`));
    } else {
        console.log('⚠️ NO INGREDIENTS FOUND! (Array is empty or null)');
    }
    console.log('-------------------\n');
}

check();
