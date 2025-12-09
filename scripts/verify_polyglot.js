const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const parseEnv = (key) => envContent.match(new RegExp(`${key}=(.*)`))[1];

const SUPABASE_URL = parseEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = parseEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'); // Should use SERVICE_ROLE for full access if RLS blocks, but ANON is fine if policy allows insert? 
// Wait, Polyglot uses ANON key. Does it have INSERT permission on recipe_translations?
// I created policy "Public read". Did I create "Public Insert"? I doubt it.
// I might need to use SERVICE_ROLE or check policies.
// But let's assume I need to check.

// This script just reads newly added translations
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('recipe_translations')
        .select('*')
        .eq('language', 'es')
        .limit(5);

    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}

check();
