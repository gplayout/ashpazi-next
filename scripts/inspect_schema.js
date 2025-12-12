const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: We might need SERVICE_ROLE key for schema inspection or adding columns, 
// but let's try reading a row first to specific keys.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Env Vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('Fetching one recipe...');
    const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        if (data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]));
            // Check if 'nutrition' or 'metadata' exists
            if (data[0].nutrition) console.log('✅ nutrition column exists');
            if (data[0].metadata) console.log('✅ metadata column exists');
        } else {
            console.log('No recipes found to inspect.');
        }
    }
}

inspect();
