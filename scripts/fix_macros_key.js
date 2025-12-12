
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMacros() {
    console.log("🔧 Fixing 'macro_nutrients' -> 'macros' mismatch...");

    // Fetch all recipes (we need to scan JSON)
    // To be efficient, we could filter by text search but scanning 1500 rows is fast enough
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name_en, nutrition_info');

    if (error) {
        console.error("DB Error:", error);
        return;
    }

    console.log(`Scanning ${recipes.length} recipes...`);
    let fixedCount = 0;

    for (const recipe of recipes) {
        const info = recipe.nutrition_info;
        if (!info) continue;

        let changed = false;

        // Helper to fix one lang object
        const fixLang = (langObj) => {
            if (langObj && langObj.macro_nutrients) {
                langObj.macros = langObj.macro_nutrients;
                delete langObj.macro_nutrients;
                return true;
            }
            return false;
        };

        if (fixLang(info.en)) changed = true;
        if (fixLang(info.fa)) changed = true;
        if (fixLang(info.es)) changed = true;

        if (changed) {
            await supabase
                .from('recipes')
                .update({ nutrition_info: info })
                .eq('id', recipe.id);

            fixedCount++;
            process.stdout.write('.'); // Progress dot
        }
    }

    console.log(`\n✅ Fixed ${fixedCount} recipes.`);
}

fixMacros();
