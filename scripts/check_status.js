require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await supabase.rpc('get_status_breakdown');
    // Wait, I don't know if RPC exists. Easier to just count grouped by status.
    // Supabase JS doesn't do group by easily without RPC.
    // I'll just check PUBLISHED count.
}
// simpler approach:
async function main2() {
    const { count: published, error } = await supabase
        .from('app_routes_manifest')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PUBLISHED');

    console.log('PUBLISHED:', published);

    const { count: blocked, error2 } = await supabase
        .from('app_routes_manifest')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'BLOCKED');

    console.log('BLOCKED:', blocked);
}

main2();
