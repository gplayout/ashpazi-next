
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
    console.log("=== DIAGNOSING REGISTRY GAPS ===");

    // 1. Load JSON IDs
    const jsonPath = 'zaffaron_golden_english.json';
    const goldenData = JSON.parse(fs.readFileSync(jsonPath));
    const jsonIds = new Set(Array.isArray(goldenData) ? goldenData.map(r => r.id || r.legacy_id) : Object.keys(goldenData).map(k => parseInt(k)));
    console.log(`JSON IDs: ${jsonIds.size}`);

    // 2. Load Registry IDs
    // Check if we need pagination (likely > 1000)
    let registryIds = new Set();
    let from = 0;
    const PAGE_SIZE = 1000;
    while (true) {
        const { data, error } = await supabase
            .from('registry_recipes')
            .select('legacy_recipe_id')
            .range(from, from + PAGE_SIZE - 1);

        if (error) { console.error("Registry Fetch Error:", error); break; }
        if (!data || data.length === 0) break;

        data.forEach(r => registryIds.add(r.legacy_recipe_id));
        from += PAGE_SIZE;
        if (data.length < PAGE_SIZE) break;
    }
    console.log(`Registry IDs: ${registryIds.size}`);

    // 3. Find Missing
    const missing = [];
    for (const id of jsonIds) {
        if (!registryIds.has(id)) {
            missing.push(id);
        }
    }

    console.log(`Found ${missing.length} IDs in JSON but NOT in Registry.`);
    if (missing.length > 0) {
        console.log("Sample Missing IDs:", missing.slice(0, 10));

        // 4. FIX: Register them?
        // To register, we need to insert into registry_recipes.
        // We need a UUID for each.
        // Does each correspond to a row in 'recipes' table?
        // Let's check if they exist in 'recipes' table.
        const { count } = await supabase.from('recipes').select('*', { count: 'exact', head: true }).in('id', missing.slice(0, 50));
        console.log(`Of the first 50 missing IDs, ${count} exist in 'recipes' table.`);

        if (count > 0) {
            console.log("ACTION REQUIRED: These recipes exist but are Unregistered. We must Mint UUIDs for them.");
        }
    }
}

diagnose();
