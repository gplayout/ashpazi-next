const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
// fallback to .env
const finalEnvPath = fs.existsSync(envPath) ? envPath : path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(finalEnvPath, 'utf-8');
const parseEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : process.env[key];
}

const SUPABASE_URL = parseEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = parseEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function count() {
    const { count, error } = await supabase
        .from('recipe_translations')
        .select('*', { count: 'exact', head: true })
        .eq('language', 'es');

    if (error) console.error(error);
    else console.log(`Total Spanish Translations: ${count}`);
}

count();
