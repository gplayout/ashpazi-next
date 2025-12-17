
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Config
const OUTPUT_DIR = path.join(__dirname, '../dictionaries_harvest');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Known seeds to help parsing (Heuristics)
const KNOWN_UNITS = [
    'پیمانه', 'قاشق غذاخوری', 'قاشق چایخوری', 'قاشق مرباخوری', 'لیوان',
    'گرم', 'کیلوگرم', 'عدد', 'لیتر', 'میلی‌لیتر', 'حبه', 'خوشه', 'شاخه', 'ورق', 'بسته'
];

const IGNORE_PHRASES = [
    'به میزان لازم', 'به مقدار لازم', 'کمی', 'مقداری', 'برای تزیین', 'دلخواه'
];

// Helper to normalize Persian numbers to English
function toEnglishDigits(str) {
    if (!str) return '';
    const map = { '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };
    return str.replace(/[۰-۹]/g, c => map[c]);
}

// Helper to clean text
function cleanText(str) {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ');
}

// Core Parser
function parseIngredientString(raw) {
    let text = raw;

    // Heuristic: Check if there is a number
    const engText = toEnglishDigits(raw);
    const numMatch = engText.match(/(\d+(\.\d+)?)/);

    let quantity = null;
    let unit = null;
    let ingredient = text;
    let notes = '';

    if (numMatch) {
        quantity = parseFloat(numMatch[0]);
    }

    // Try to find Unit
    for (const u of KNOWN_UNITS) {
        if (text.includes(u)) {
            unit = u;
            break;
        }
    }

    // Try to extract Ingredient Name
    let remainder = text;
    if (quantity !== null) {
        remainder = remainder.replace(new RegExp(quantity.toString(), 'g'), '').replace(/[۰-۹]+/g, '');
    }
    if (unit) {
        remainder = remainder.replace(unit, '');
    }

    // Remove delimiters
    remainder = remainder.replace(/[,،\-–]/g, ' ');

    // Clean
    let probableName = cleanText(remainder);

    // Check if name contains ignore phrases
    for (const phrase of IGNORE_PHRASES) {
        if (probableName.includes(phrase)) {
            probableName = probableName.replace(phrase, '').trim();
            notes = phrase; // Captured as note
        }
    }

    return {
        raw: raw,
        quantity: quantity,
        unit: unit,
        ingredient_name: probableName.length > 1 ? probableName : text, // Fallback if we stripped everything
        notes: notes
    };
}

// Stats
const stats = {
    recipes_scanned: 0,
    ingredients_found: new Map(), // name -> { count, raw_examples, recipes }
    units_found: new Map(), // name -> count
    unparsed: 0
};

async function run() {
    console.log("Starting Dictionary Harvest...");

    // fetch all with pagination
    let allRecipes = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const from = page * pageSize;
        const to = (page + 1) * pageSize - 1;

        console.log(`Fetching batch ${page + 1} (${from}-${to})...`);
        const { data, error } = await supabase
            .from('recipes')
            .select('id, ingredients')
            .range(from, to);

        if (error) throw error;

        if (data && data.length > 0) {
            allRecipes = allRecipes.concat(data);
            // If data size is less than requested, we reached the end
            if (data.length < pageSize) {
                hasMore = false;
            } else {
                page++;
            }
        } else {
            hasMore = false; // No more data
        }
    }

    stats.recipes_scanned = allRecipes.length;
    console.log(`Scanned ${allRecipes.length} recipes.`);

    allRecipes.forEach(r => {
        if (!r.ingredients || !Array.isArray(r.ingredients)) return;

        r.ingredients.forEach(rawItem => {
            const parsed = parseIngredientString(rawItem);

            // Track Ingredient
            const name = parsed.ingredient_name || "UNKNOWN";
            if (!stats.ingredients_found.has(name)) {
                stats.ingredients_found.set(name, { count: 0, raw: new Set(), recipes: [] });
            }
            const entry = stats.ingredients_found.get(name);
            entry.count++;
            entry.raw.add(rawItem);
            if (entry.recipes.length < 3) entry.recipes.push(r.id);

            // Track Unit
            if (parsed.unit) {
                const u = parsed.unit;
                stats.units_found.set(u, (stats.units_found.get(u) || 0) + 1);
            } else {
                stats.unparsed++;
            }
        });
    });

    // Generate Outputs

    // 1. Ingredients CSV
    const ingHeader = "raw_text_examples,normalized_suggestion,occurrences,example_recipe_ids,notes\n";
    let ingContent = ingHeader;

    const sortedIngs = [...stats.ingredients_found.entries()].sort((a, b) => b[1].count - a[1].count);

    sortedIngs.forEach(([name, data]) => {
        const rawEx = Array.from(data.raw).slice(0, 3).join(" | ").replace(/,/g, ';');
        ingContent += `"${rawEx}","${name}","${data.count}","${data.recipes.join(';')}",""\n`;
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'ingredients_master_candidates.csv'), ingContent);

    // 2. Units CSV
    const unitHeader = "raw_text,normalized_code,type,occurrences,notes\n";
    let unitContent = unitHeader;
    [...stats.units_found.entries()].sort((a, b) => b[1] - a[1]).forEach(([u, count]) => {
        unitContent += `"${u}","${u}","unknown","${count}",""\n`;
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'units_master_candidates.csv'), unitContent);

    // 3. Extraction Report
    const report = {
        total_recipes_scanned: stats.recipes_scanned,
        total_unique_ingredients_found: stats.ingredients_found.size,
        total_unique_units_found: stats.units_found.size,
        unparsed_tokens_count: stats.unparsed,
        top_ingredients: sortedIngs.slice(0, 10).map(x => x[0]),
        recommendation: "Review ingredients_master_candidates.csv."
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'extraction_report.json'), JSON.stringify(report, null, 2));

    console.log("Harvest Complete. Check `dictionaries_harvest/` output.");
}

run();
