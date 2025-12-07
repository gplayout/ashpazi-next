const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const parseEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : null;
};

const supabase = createClient(
    parseEnv('NEXT_PUBLIC_SUPABASE_URL'),
    parseEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
);

async function check() {
    const { count, error } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .is('image', null);

    if (error) console.error(error);
    else console.log(`Remaining missing images: ${count}`);
}

check();
