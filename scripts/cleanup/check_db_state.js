const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    // Check distribution of statuses
    const { data, error } = await supabase.from('recipe_pipeline_state').select('status');

    if (error) {
        console.log("Error reading state:", error.message);
        // Fallback: check count of recipes vs pipeline state
        const { count } = await supabase.from('recipes').select('*', { count: 'exact', head: true });
        console.log("Total Raw Recipes:", count);
        return;
    }

    const counts = {};
    data.forEach(r => {
        counts[r.status] = (counts[r.status] || 0) + 1;
    });

    console.log("Pipeline Status Distribution:", counts);
}

check();
