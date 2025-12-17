require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
    console.log('Verifying pipeline state...');

    // 1. Fetch relevant rows (status != new ideally, but let's just fetch all test ones)
    // We don't have IDs handy unless we query by name again, or just query latest 2 rows from pipeline state
    // Let's query by finding the test recipes first.

    const { data: recipes } = await supabase
        .from('recipes')
        .select('id, name')
        .ilike('name', 'TEST_%')
        .order('id', { ascending: false })
        .limit(5); // In case of retries

    if (!recipes || recipes.length === 0) {
        console.log('No test recipes found!');
        return;
    }

    const ids = recipes.map(r => r.id);
    console.log('Checking IDs:', ids);

    const { data: states } = await supabase
        .from('recipe_pipeline_state')
        .select('*')
        .in('legacy_recipe_id', ids);

    console.log('States:', JSON.stringify(states, null, 2));

    // Check if Valid one made it to normalized_ok
    // Check if Invalid one made it to blocked_review
}

verify();
