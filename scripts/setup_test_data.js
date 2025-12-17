require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setup() {
    console.log('Inserting test data...');

    const validName = 'TEST_VALID_RECIPE_' + Date.now();
    const invalidName = 'TEST_INVALID_RECIPE_' + Date.now();

    // 1. Insert Legacy Recipes (Fixed Schema requires 'instructions')
    const { data: recipes, error: rErr } = await supabase
        .from('recipes')
        .insert([
            {
                name: validName,
                ingredients: ['100 گرم نمک', '1 عدد فلفل سیاه'],
                prep_time_minutes: 10,
                instructions: ['Step 1: Mix'] // ARRAY text
            },
            {
                name: invalidName,
                ingredients: ['500 UnmappedThing'],
                prep_time_minutes: 5,
                instructions: ['Step 1: Fail'] // ARRAY text
            }
        ])
        .select('id, name');

    if (rErr) {
        console.error('Recipes Insert Error:', rErr);
        return;
    }

    if (!recipes || recipes.length < 2) {
        console.error('Failed to get inserted IDs');
        return;
    }

    console.log('Recipes inserted:', recipes);

    const validId = recipes.find(r => r.name === validName).id;
    const invalidId = recipes.find(r => r.name === invalidName).id;

    // 2. Insert Pipeline State
    const { error: pErr } = await supabase
        .from('recipe_pipeline_state')
        .upsert([
            { legacy_recipe_id: validId, status: 'new', error_log: null },
            { legacy_recipe_id: invalidId, status: 'new', error_log: null }
        ], { onConflict: 'legacy_recipe_id' });

    if (pErr) console.error('Pipeline State Insert Error:', pErr);
    else console.log(`Pipeline State inserted for IDs: ${validId}, ${invalidId}`);
}

setup();
