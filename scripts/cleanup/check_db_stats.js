require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMinMax() {
    console.log("🔍 Checking Database Limits...");

    // Get Total Count
    const { count } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true });

    // Get Min ID
    const { data: minData } = await supabase
        .from('recipes')
        .select('id')
        .order('id', { ascending: true })
        .limit(1);

    // Get Max ID
    const { data: maxData } = await supabase
        .from('recipes')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

    console.log(`📊 Stats:`);
    console.log(`   Total Records: ${count}`);
    console.log(`   Min ID: ${minData?.[0]?.id || 'N/A'}`);
    console.log(`   Max ID: ${maxData?.[0]?.id || 'N/A'}`);

    // Progress Check
    const { count: done } = await supabase
        .from('content_translations')
        .select('*', { count: 'exact', head: true });

    console.log(`   Migration Progress: ${done} / ${count} (${Math.round(done / count * 100)}%)`);
}

checkMinMax();
