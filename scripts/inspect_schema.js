require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
    // We can infer columns by selecting a single row and checking keys
    // OR we can try to select '*' and let it return what it has.
    const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Inspect Error:', error);
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
    } else {
        // If empty, we can't infer keys easily from REST without metadata table access
        // But we know it's not empty because earlier steps worked partially
        console.log('Table seems empty or no access. trying to insert a dummy to see errors? No, risky.');
        console.log('Returned data:', data);
    }
}

inspect();
