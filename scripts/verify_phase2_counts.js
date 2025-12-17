
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Init Client (Anon is fine for SELECT if RLS policies are public as per schema)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
    console.log("=== CHECKING PHASE 2 COUNTS ===");

    // Ingredients
    const { count: ingCount } = await supabase.from('ingredients_master').select('*', { count: 'exact', head: true });
    console.log(`Ingredients Master: ${ingCount}`);

    // Registry
    const { count: regCount } = await supabase.from('registry_recipes').select('*', { count: 'exact', head: true });
    console.log(`Registry Recipes:   ${regCount}`);

    // Pipeline State
    const { count: published } = await supabase.from('recipe_pipeline_state').select('*', { count: 'exact', head: true }).eq('status', 'published');
    const { count: blocked } = await supabase.from('recipe_pipeline_state').select('*', { count: 'exact', head: true }).eq('status', 'blocked_review');

    console.log(`Pipeline - Published: ${published}`);
    console.log(`Pipeline - Blocked:   ${blocked}`);
    console.log(`Pipeline - Total:     ${published + blocked}`);
}

check();
