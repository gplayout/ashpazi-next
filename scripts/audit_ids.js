
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    console.log("Starting ID Audit...");

    // 1. Fetch ALL IDs from DB
    let allIds = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const from = page * pageSize;
        const to = (page + 1) * pageSize - 1;
        const { data, error } = await supabase
            .from('recipes')
            .select('id')
            .range(from, to);

        if (error) throw error;
        if (data && data.length > 0) {
            allIds = allIds.concat(data.map(r => r.id));
            if (data.length < pageSize) hasMore = false;
            else page++;
        } else {
            hasMore = false;
        }
    }

    // Sort integer IDs
    allIds.sort((a, b) => a - b);
    console.log(`DB returned ${allIds.length} IDs.`);

    const minId = allIds[0];
    const maxId = allIds[allIds.length - 1];
    console.log(`Min ID: ${minId}, Max ID: ${maxId}`);

    // 2. Identify Gaps (Assuming 1 to 1542 range based on user input, or MaxID)
    // User says "Total recipes: EXACTLY 1542". This could mean IDs 1..1542.
    // Let's check gaps in 1..1542

    const missingIds = [];
    const targetSet = new Set(allIds);

    for (let i = 1; i <= 1542; i++) {
        if (!targetSet.has(i)) {
            missingIds.push(i);
        }
    }

    console.log(`Found ${missingIds.length} missing IDs in range 1-1542.`);
    console.log("Missing IDs:", missingIds.join(", "));

    // 3. Attempt to fetch missing IDs individually
    // Maybe they exist but weren't returned in the list?
    const recovered = [];
    const trulyMissing = [];

    for (const id of missingIds) {
        const { data, error } = await supabase
            .from('recipes')
            .select('id, ingredients')
            .eq('id', id)
            .single();

        if (data) {
            recovered.push(data);
        } else {
            trulyMissing.push(id);
        }
    }

    console.log(`Recovered ${recovered.length} recipes by direct ID lookup.`);
    console.log(`Truly missing / Unreachable: ${trulyMissing.length}`);

    // Output results
    const result = {
        db_list_count: allIds.length,
        missing_ids_count: missingIds.length,
        missing_ids_list: missingIds,
        recovered_count: recovered.length,
        truly_missing_count: trulyMissing.length,
        truly_missing_list: trulyMissing
    };

    console.log(JSON.stringify(result, null, 2));
}

run();
