
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Paths
const INGREDIENTS_CSV = path.join(__dirname, '../dictionaries_harvest/ingredients_master_candidates.csv');
const UNITS_CSV = path.join(__dirname, '../dictionaries_harvest/units_master_candidates.csv');

// Simple CSV Parser (Quotes aware)
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
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
}

// Helper to clean text
const clean = (str) => str ? str.trim() : '';

async function runDryRun() {
    console.log("=== STARTING DRY RUN: REGISTRY NORMALIZATION ===");
    console.log("Mode: READ-ONLY. No writes will be performed.\n");

    // 1. Load Dictionaries
    console.log("--> Loading Dictionaries...");

    let ingCandidates = [];
    let unitCandidates = [];

    try {
        const ingText = fs.readFileSync(INGREDIENTS_CSV, 'utf-8');
        ingCandidates = parseCSV(ingText);

        const unitText = fs.readFileSync(UNITS_CSV, 'utf-8');
        unitCandidates = parseCSV(unitText);
    } catch (e) {
        console.error("Error reading CSVs:", e.message);
        return;
    }

    // Create Maps
    const ingredientMap = new Map();
    const unitMap = new Map();

    console.log(`--> Loaded ${ingCandidates.length} Ingredient Candidates.`);
    console.log(`--> Loaded ${unitCandidates.length} Unit Candidates.`);

    // Simulate Master Seeding
    let ingredientsMasterCount = 0;
    let unitsMasterCount = 0;

    ingCandidates.forEach((row, index) => {
        const name = clean(row.normalized_suggestion);
        if (name && !ingredientMap.has(name)) {
            ingredientMap.set(name, { id: `ing_${index}`, name: name });
            ingredientsMasterCount++;
        }
    });

    unitCandidates.forEach((row, index) => {
        const name = clean(row.normalized_code);
        if (name && !unitMap.has(name)) {
            unitMap.set(name, { id: `unit_${index}`, name: name });
            unitsMasterCount++;
        }
    });

    console.log(`\n[PLAN] Seed public.ingredients_master: ${ingredientsMasterCount} rows`);
    console.log(`[PLAN] Seed public.units_master: ${unitsMasterCount} rows`);


    // 2. Fetch Legacy Recipes
    console.log("\n--> Fetching Legacy Recipes...");
    let allRecipes = [];
    let from = 0;
    const batchSize = 1000;
    let fetchMore = true;

    while (fetchMore) {
        const { data, error } = await supabase
            .from('recipes')
            .select('id, ingredients')
            .range(from, from + batchSize - 1);

        if (error) {
            console.error("Error fetching recipes:", error);
            return;
        }

        allRecipes = allRecipes.concat(data);
        if (data.length < batchSize) fetchMore = false;
        from += batchSize;
    }

    console.log(`--> Fetched ${allRecipes.length} Legacy Recipes.\n`);

    // 3. Simulate Registry Creation
    let stats = {
        registryRecipes: 0,
        recipeGroups: 0,
        recipeIngredients: 0,
        totalIngredientLines: 0,
        mappedIngredients: 0,
        unknownIngredients: 0
    };

    const unknownIngredientList = new Set();
    // Sort keys by length desc to prioritize longest matches
    const normalizedIngKeys = Array.from(ingredientMap.keys()).sort((a, b) => b.length - a.length);

    for (const r of allRecipes) {
        stats.registryRecipes++;
        stats.recipeGroups++;

        if (!r.ingredients || !Array.isArray(r.ingredients)) continue;

        for (const rawStr of r.ingredients) {
            stats.totalIngredientLines++;

            let matched = false;
            // Naive checks for dry run matching
            for (const key of normalizedIngKeys) {
                if (rawStr.includes(key)) {
                    matched = true;
                    break;
                }
            }

            if (matched) {
                stats.mappedIngredients++;
                stats.recipeIngredients++;
            } else {
                stats.unknownIngredients++;
                unknownIngredientList.add(rawStr.substring(0, 60));
            }
        }
    }

    // 4. Report
    console.log("=== DRY RUN RESULTS ===");
    console.log(`Total Legacy Recipes Scanned: ${allRecipes.length}`);
    console.log(`[PLAN] Create registry_recipes: ${stats.registryRecipes}`);
    console.log(`[PLAN] Create recipe_groups:    ${stats.recipeGroups}`);
    console.log(`[PLAN] Create recipe_ingredients: ${stats.recipeIngredients}`);
    console.log("-----------------------------------------");
    console.log(`Total Ingredient Lines: . . . ${stats.totalIngredientLines}`);
    console.log(`Mapped (Known): . . . . . . . ${stats.mappedIngredients} (${((stats.mappedIngredients / stats.totalIngredientLines) * 100).toFixed(1)}%)`);
    console.log(`Unknown/Unmapped: . . . . . . ${stats.unknownIngredients}`);

    if (stats.unknownIngredients > 0) {
        console.log("\nSample Unknown Ingredients (Top 10):");
        Array.from(unknownIngredientList).slice(0, 10).forEach(i => console.log(` - ${i}`));
        console.log("\n[NOTE] These will be flagged as 'blocked_review' in pipeline.");
    }

    console.log("\nSummary verify:");
    console.log(`1. Legacy Check: ${allRecipes.length === 1525 ? 'OK (1525)' : 'WARNING (' + allRecipes.length + ')'}`);
    console.log("Dry Run Complete.");
}

runDryRun();
