
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function inspectLast17() {
    console.log("=== INSPECTING LATEST 20 RECIPES ===");

    // Fetch latest 20 recipes
    const { data: recipes } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    if (!recipes || recipes.length === 0) {
        console.log("No recipes found.");
        return;
    }

    // Get translations for them
    const recipeIds = recipes.map(r => r.id);
    const { data: registryMap } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .in('legacy_recipe_id', recipeIds);

    const uuidMap = {}; // LegacyID -> UUID
    registryMap.forEach(row => uuidMap[row.legacy_recipe_id] = row.id);

    const uuids = Object.values(uuidMap);

    let allTranslations = [];
    if (uuids.length > 0) {
        const { data: trs } = await supabase
            .from('content_translations')
            .select('recipe_id, language_code, title, instructions, qa_metadata, description')
            .in('recipe_id', uuids);
        allTranslations = trs || [];
    }

    // Analyze each
    for (const r of recipes) {
        const uuid = uuidMap[r.id];
        const trs = allTranslations.filter(t => t.recipe_id === uuid);

        console.log(`\n[${r.id}] ${r.name} (UUID: ${uuid ? 'YES' : 'NO'})`);
        console.log(`   Translations Found: ${trs.length} (${trs.map(t => t.language_code).join(',')})`);

        // Check English Translation
        const enTr = trs.find(t => t.language_code === 'en');
        if (enTr) {
            const mkt = enTr.qa_metadata?.marketing_description;
            const desc = enTr.description;
            const inst = enTr.instructions;
            let instText = "NULL";

            if (typeof inst === 'object' && Array.isArray(inst) && inst[0]) {
                instText = inst[0].text || JSON.stringify(inst[0]);
            } else if (typeof inst === 'string') {
                instText = inst.substring(0, 30);
            }

            console.log(`   [EN] Marketing: ${mkt ? 'YES' : 'NO'} ("${mkt ? mkt.substring(0, 30) : ''}...")`);
            console.log(`   [EN] Direct Desc: ${desc ? 'YES' : 'NO'}`);
            console.log(`   [EN] Instructions: ${inst ? 'YES' : 'NO'} ("${instText.substring(0, 30)}...")`);
        } else {
            console.log(`   [EN] MISSING!`);
        }

        // Check Legacy
        const legacyInst = r.instructions;
        const legacyStr = typeof legacyInst === 'string' ? legacyInst : JSON.stringify(legacyInst);
        const isLegacyFarsi = /[\u0600-\u06FF]/.test(legacyStr);
        console.log(`   [LEGACY] Farsi? ${isLegacyFarsi}`);
        if (!isLegacyFarsi) {
            console.log(`   [LEGACY CONTENT]: "${legacyStr.substring(0, 100)}..."`);
        }
    }
}

inspectLast17();
