
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function inspectData() {
    console.log("=== INSPECTING RECIPE DATA (RANDOM 5) ===");

    // Fetch 5 random recipes
    const { data: recipes } = await supabase
        .from('recipes')
        .select('*')
        .limit(5);

    for (const r of recipes) {
        console.log(`\n\n--------------------------------------------------`);
        console.log(`RECIPE [${r.id}]: ${r.name}`);

        let legacyInst = r.instructions;
        if (typeof legacyInst !== 'string') legacyInst = JSON.stringify(legacyInst);
        const legacySample = legacyInst ? legacyInst.substring(0, 100) : 'NULL';
        console.log(`Legacy Source Instructions (Start): "${legacySample}"`);
        console.log(`Legacy Has Farsi? ` + /[\u0600-\u06FF]/.test(legacySample));

        const { data: registry } = await supabase
            .from('registry_recipes')
            .select('id')
            .eq('legacy_recipe_id', r.id)
            .single();

        if (registry) {
            const { data: translations } = await supabase
                .from('content_translations')
                .select('*')
                .eq('recipe_id', registry.id);

            if (translations) {
                translations.forEach(tr => {
                    console.log(`\n  >> TRANSLATION ROW [${tr.language_code}]`);
                    const mkt = tr.qa_metadata?.marketing_description || 'NULL';
                    const mktSample = mkt.substring(0, 50);
                    console.log(`     Marketing: "${mktSample}..."`);
                    console.log(`     Marketing Has Farsi? ` + /[\u0600-\u06FF]/.test(mktSample));

                    let instr = tr.instructions;
                    if (typeof instr !== 'string') instr = JSON.stringify(instr);
                    const instrSample = instr.substring(0, 50);
                    console.log(`     Instructions: "${instrSample}..."`);
                    console.log(`     Instructions Has Farsi? ` + /[\u0600-\u06FF]/.test(instrSample));
                });
            }
        } else {
            console.log("No Registry Entry (Pure Legacy)");
        }
    }
}

inspectData();
