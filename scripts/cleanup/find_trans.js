const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findTrans() {
    console.log("Searching translations for 'Cantonese'...");
    const { data, error } = await supabase
        .from('content_translations')
        .select('recipe_id, title')
        .ilike('title', '%Cantonese%')
        .limit(10);

    if (data) {
        data.forEach(d => console.log(`[${d.recipe_id}] ${d.title}`));

        // Auto-delete if we find it
        if (data.length > 0) {
            const target = data[0];
            console.log(`Deleting target: ${target.title}`);
            const { error: delErr } = await supabase.from('content_translations').delete().eq('recipe_id', target.recipe_id).eq('language_code', 'en');

            if (delErr) console.log("Delete Error:", delErr);
            else console.log("Deleted translation.");

            // Reset pipeline state
            const { data: reg } = await supabase.from('registry_recipes').select('legacy_recipe_id').eq('id', target.recipe_id).single();
            if (reg) {
                await supabase.from('recipe_pipeline_state').update({ status: 'manual_retry' }).eq('legacy_recipe_id', reg.legacy_recipe_id);
                console.log(`Reset pipeline state for Legacy ID ${reg.legacy_recipe_id} to manual_retry.`);
            }
        }
    } else {
        console.log("No Cantonese recipes found.");
    }
}
findTrans();
