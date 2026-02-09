require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
    const { data, error } = await supabase
        .from('app_routes_manifest')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Row keys:', Object.keys(data[0] || {}));
        console.log('Sample Row:', data[0]);
    }
}

inspect();
