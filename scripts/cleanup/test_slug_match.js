
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSlugMatching() {
    const slug = 'Classic-Chinese-Style-Egg-Fried-Rice';

    // Method 1: Current (Space replacement) - Likely failing
    const query1 = slug.replace(/-/g, ' ');
    console.log(`Testing Query 1: "${query1}"`);

    const { data: d1 } = await supabase
        .from('recipes')
        .select('id, name_en')
        .ilike('name_en', query1)
        .maybeSingle();

    console.log('Result 1:', d1 ? 'FOUND' : 'NOT FOUND');

    // Method 2: Wildcard replacement
    const query2 = slug.split('-').join('%'); // "Classic%Chinese%Style%Egg%Fried%Rice"
    console.log(`Testing Query 2: "${query2}"`);

    const { data: d2 } = await supabase
        .from('recipes')
        .select('id, name_en')
        .ilike('name_en', query2)
        .maybeSingle();

    console.log('Result 2:', d2 ? `FOUND: ${d2.name_en}` : 'NOT FOUND');
}

testSlugMatching();
