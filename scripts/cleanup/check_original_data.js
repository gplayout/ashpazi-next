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

// 3. Count
async function verify() {
    const { count: recipesCount, error: rErr } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true });

    const { count: registryCount, error: regErr } = await supabase
        .from('registry_recipes')
        .select('*', { count: 'exact', head: true });

    if (rErr) console.error('Recipes Error:', rErr);
    if (regErr) console.error('Registry Error:', regErr);

    console.log('--- Data Integrity Check ---');
    console.log(`Original Recipes (Legacy): ${recipesCount}`);
    console.log(`Registry Recipes (Active): ${registryCount}`);
    console.log('----------------------------');
}

verify();
