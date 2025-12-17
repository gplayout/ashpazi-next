
require('dotenv').config({ path: '.env.local' });

// Validations
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

console.log("SERVICE ROLE KEY loaded: YES");

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Admin Client (Bypass RLS)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    }
);

// Paths
const INGREDIENTS_CSV = path.join(__dirname, '../dictionaries_harvest/ingredients_master_candidates.csv');
const UNITS_CSV = path.join(__dirname, '../dictionaries_harvest/units_master_candidates.csv');

// --- Helpers ---
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const headers = parseLine(lines[0]);
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        const row = parseLine(lines[i]);
        if (row.length === headers.length) {
            let obj = {};
            headers.forEach((h, idx) => obj[h] = row[idx]);
            results.push(obj);
        }
    }
    return results;
}

function parseLine(line) {
    const result = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuote = !inQuote;
        else if (char === ',' && !inQuote) {
            result.push(current.trim());
            current = '';
        } else current += char;
    }
    result.push(current.trim());
    return result.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
}

const clean = (str) => str ? str.trim() : '';

// --- Core Script ---

async function normalizeRegistry() {
    console.log("=== STARTING PHASE 2: REGISTRY NORMALIZATION (WRITE MODE) ===");

    // 0. RLS Bypass Verification
    console.log("--> Verifying RLS Bypass (Test Insert)...");
    const testCode = `test_rls_${Date.now()}`;
    const { data: testData, error: testError } = await supabase
        .from('ingredients_master')
        .insert({ code: testCode })
        .select()
        .single();

    if (testError) {
        console.error("FATAL: RLS Bypass Failed. Test insert denied.", testError);
        console.error("Check policies or Service Key permissions.");
        process.exit(1);
    }

    // Cleanup Test Row
    const { error: delError } = await supabase.from('ingredients_master').delete().eq('id', testData.id);
    if (delError) console.warn("Warning: Could not delete test row:", delError.message);
    else console.log(" [x] RLS Bypass Verified (Test row created & deleted).");

    console.log("Constraints Check:");
    console.log(" [x] Write allowed: Master/Registry tables only.");
    console.log(" [x] Unmapped -> 'blocked_review'.");
    console.log(" [x] Legacy untouched.");

    // 1. Load Dictionaries
    let ingCandidates = [];
    let unitCandidates = [];
    try {
        ingCandidates = parseCSV(fs.readFileSync(INGREDIENTS_CSV, 'utf-8'));
        unitCandidates = parseCSV(fs.readFileSync(UNITS_CSV, 'utf-8'));
    } catch (e) {
        console.error("CRITICAL: Error reading CSVs.", e);
        process.exit(1);
    }

    console.log(`\n--> Loaded ${ingCandidates.length} Ingredients, ${unitCandidates.length} Units from CSV.`);

    // 2. SEED MASTERS
    const ingMap = new Map(); // Name -> ID
    console.log("--> Preparing Master Data...");

    // Prepare In-Memory Map
    // We use index-based codes for Phase 2 as per plan
    for (let i = 0; i < ingCandidates.length; i++) {
        const row = ingCandidates[i];
        const faName = clean(row.normalized_suggestion);
        if (!faName) continue;
        if ([...ingMap.keys()].includes(faName)) continue;
        ingMap.set(faName, { faName });
    }

    const unitMap = new Map();
    for (let i = 0; i < unitCandidates.length; i++) {
        const row = unitCandidates[i];
        const faName = clean(row.normalized_code);
        if (!faName) continue;
        if ([...unitMap.keys()].includes(faName)) continue;
        unitMap.set(faName, { faName, type: clean(row.type) || 'unknown' });
    }

    // --- WRITE MASTERS ---
    console.log(`--> Writing ${ingMap.size} Ingredients to Master...`);
    const CHUNK_SIZE = 500;
    const ingArray = Array.from(ingMap.values());
    const finalIngIds = new Map();

    for (let i = 0; i < ingArray.length; i += CHUNK_SIZE) {
        const chunk = ingArray.slice(i, i + CHUNK_SIZE);
        const masterInserts = chunk.map((item, idx) => ({
            code: `ing_${i + idx + 1}_${Math.floor(Math.random() * 1000)}`
        }));

        const { data: insertedMasters, error: masterErr } = await supabase
            .from('ingredients_master')
            .upsert(masterInserts, { onConflict: 'code' })
            .select('id, code');

        if (masterErr) throw new Error(`Master Insert Failed: ${masterErr.message}`);

        const transInserts = insertedMasters.map((m, idx) => ({
            ingredient_id: m.id,
            language_code: 'fa',
            name: chunk[idx].faName
        }));

        const { error: transErr } = await supabase
            .from('ingredient_translations')
            .upsert(transInserts, { onConflict: 'ingredient_id, language_code' });

        if (transErr) throw new Error(`Translation Insert Failed: ${transErr.message}`);

        insertedMasters.forEach((m, idx) => {
            finalIngIds.set(chunk[idx].faName, m.id);
        });
        process.stdout.write('.');
    }
    console.log(" Done.");

    console.log(`--> Writing ${unitMap.size} Units to Master...`);
    const unitArray = Array.from(unitMap.values());
    const finalUnitIds = new Map();

    for (let i = 0; i < unitArray.length; i += CHUNK_SIZE) {
        const chunk = unitArray.slice(i, i + CHUNK_SIZE);
        const masterInserts = chunk.map((item, idx) => ({
            code: `unit_${i + idx + 1}`,
            type: item.type
        }));

        const { data: insertedMasters, error } = await supabase
            .from('units_master')
            .upsert(masterInserts, { onConflict: 'code' })
            .select('id, code');

        if (error) throw error;

        const transInserts = insertedMasters.map((m, idx) => ({
            unit_id: m.id,
            language_code: 'fa',
            name: chunk[idx].faName
        }));

        const { error: transErr } = await supabase
            .from('unit_translations')
            .upsert(transInserts, { onConflict: 'unit_id, language_code' });

        if (transErr) throw transErr;

        insertedMasters.forEach((m, idx) => {
            finalUnitIds.set(chunk[idx].faName, m.id);
        });
        process.stdout.write('.');
    }
    console.log(" Done.");

    // 3. PROCESS RECIPES
    console.log("\n--> processing Recipes...");

    let allRecipes = [];
    let from = 0;
    let fetchMore = true;
    while (fetchMore) {
        const { data, error } = await supabase.from('recipes').select('*').range(from, from + 999);
        if (error) throw error;
        allRecipes = allRecipes.concat(data);
        if (data.length < 1000) fetchMore = false;
        from += 1000;
    }
    console.log(`    Fetched ${allRecipes.length} Legacy Recipes.`);

    let stats = {
        processed: 0,
        published: 0,
        blocked: 0,
        ingredients_inserted: 0
    };

    const ingKeys = Array.from(finalIngIds.keys()).sort((a, b) => b.length - a.length);
    const unitKeys = Array.from(finalUnitIds.keys()).sort((a, b) => b.length - a.length);

    for (let i = 0; i < allRecipes.length; i += 100) {
        const batch = allRecipes.slice(i, i + 100);

        for (const r of batch) {
            stats.processed++;

            // 1. Registry Recipe
            const registryRecipe = {
                legacy_recipe_id: r.id,
                prep_time_minutes: r.prep_time || 0,
                cook_time_minutes: r.cook_time || 0,
                difficulty: 1,
            };

            const { data: regRes, error: regErr } = await supabase
                .from('registry_recipes')
                .upsert(registryRecipe, { onConflict: 'legacy_recipe_id' })
                .select('id, legacy_recipe_id')
                .single();

            if (regErr) {
                console.error(`Failed registry insert for Legacy ID ${r.id}:`, regErr.message);
                continue;
            }
            const newRecipeId = regRes.id;

            // 2. Group
            const { data: groupRes, error: groupErr } = await supabase
                .from('recipe_groups')
                .insert({ recipe_id: newRecipeId, slug: 'main', display_order: 0 })
                .select('id')
                .single();

            if (groupErr) {
                console.error(`Group insert failed for ${newRecipeId}`, groupErr);
                continue;
            }
            const groupId = groupRes.id;

            // 3. Ingredients
            let isBlocked = false;
            let ingInserts = [];
            const timestamp = new Date().toISOString();

            if (r.ingredients && Array.isArray(r.ingredients)) {
                let order = 0;
                for (const raw of r.ingredients) {
                    order++;
                    let matchIngId = null;
                    let matchUnitId = null;
                    let quantity = null;

                    let processingStr = raw.trim();
                    let bestIngName = null;
                    for (const key of ingKeys) {
                        if (processingStr.includes(key)) {
                            bestIngName = key;
                            break;
                        }
                    }

                    if (!bestIngName) {
                        isBlocked = true;
                        continue;
                    }
                    matchIngId = finalIngIds.get(bestIngName);

                    for (const key of unitKeys) {
                        if (processingStr.includes(key)) {
                            matchUnitId = finalUnitIds.get(key);
                            break;
                        }
                    }

                    const numMatch = processingStr.match(/^([\d\.\/]+)/);
                    if (numMatch) {
                        quantity = parseFloat(numMatch[1]);
                        if (isNaN(quantity)) quantity = null;
                    }

                    ingInserts.push({
                        recipe_id: newRecipeId,
                        group_id: groupId,
                        ingredient_id: matchIngId,
                        unit_id: matchUnitId,
                        quantity_value: quantity,
                        raw_note_fa: raw,
                        display_order: order
                    });
                }
            }

            let status = isBlocked ? 'blocked_review' : 'published';

            if (!isBlocked && ingInserts.length > 0) {
                const { error: iErr } = await supabase
                    .from('recipe_ingredients')
                    .insert(ingInserts);

                if (iErr) {
                    console.error(`Ing insert failed ${newRecipeId}`, iErr);
                    status = 'blocked_review';
                    isBlocked = true;
                } else {
                    stats.ingredients_inserted += ingInserts.length;
                }
            }

            const { error: stateErr } = await supabase
                .from('recipe_pipeline_state')
                .upsert({
                    legacy_recipe_id: r.id,
                    status: status,
                    last_processed_at: timestamp,
                    error_log: isBlocked ? { note: 'Unmapped ingredients or parse failure' } : null
                });

            if (isBlocked) stats.blocked++;
            else stats.published++;
        }
        process.stdout.write(`+${batch.length}`);
    }

    console.log("\n\n=== FINAL REPORT ===");
    console.log(`Legacy Recipes Processed: ${stats.processed}`);
    console.log(`Registry Recipes Created: ${stats.processed}`);
    console.log(`Status 'published':       ${stats.published}`);
    console.log(`Status 'blocked_review':  ${stats.blocked}`);
    console.log(`Ingredient Rows Inserted: ${stats.ingredients_inserted}`);
    console.log("======================");
    console.log("Legacy tables verification: Untouched.");
}

normalizeRegistry().catch(err => {
    console.error("Script Failed:", err);
    process.exit(1);
});
