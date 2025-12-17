require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
    console.log('Inspecting content_translations schema...');
    const { data, error } = await supabase
        .from('content_translations')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        // If table is empty, we might not get keys if Supabase REST returns empty array.
        // But usually we get [] if empty. If it returns null/error, table likely missing.
        // If it works but empty, we can't infer keys easily via select *. 
        // We'll trust previous phase docs OR start with assumptions and let user correct if needed.
        // BUT user explicitly asked to "Verify schema".
        // Better trick: Insert a dummy row with ALL potential columns (safely rolled back or just checked via error message).
        // Or just print what we get.
        console.log('Result:', data);
        if (data && data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
        } else {
            console.log('Table empty or no access. Cannot infer columns from SELECT *. checking error logs...');
        }
    }
}

inspect();
