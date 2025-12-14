
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    // There is no direct "list tables" in JS client without rpc, 
    // but we can try to select from expected tables and catch errors.
    const tables = ['profiles', 'favorites', 'user_favorites'];
    for (const t of tables) {
        const { error } = await supabase.from(t).select('count', { count: 'exact', head: true });
        if (error) console.log(`❌ Table '${t}' missing or error: ${error.message}`);
        else console.log(`✅ Table '${t}' exists.`);
    }
}

check();
