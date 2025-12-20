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
console.log('URL:', env.NEXT_PUBLIC_SUPABASE_URL ? 'Loaded' : 'Missing');
console.log('Key:', env.SUPABASE_SERVICE_ROLE_KEY ? 'Loaded' : 'Missing');

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

// 3. Check Count
async function check() {
    try {
        const { count, error } = await supabase
            .from('content_translations')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Supabase Error:', error.message);
            return;
        }

        console.log('Total Translations (Live Count):', count);

        // Also check simplified group
        const { data } = await supabase.from('content_translations').select('language_code');
        if (data) {
            const stats = {};
            data.forEach(r => stats[r.language_code] = (stats[r.language_code] || 0) + 1);
            console.log('Breakdown:', stats);
        }

    } catch (e) {
        console.error('Script Error:', e.message);
    }
}

check();
