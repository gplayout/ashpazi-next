
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

function parseEnv(key) {
    let val = process.env[key];
    if (!val) {
        val = process.env['VITE_' + key] || process.env['NEXT_PUBLIC_' + key] || process.env['REACT_APP_' + key];
    }
    return val;
}

const SUPABASE_URL = parseEnv('SUPABASE_URL');
const SUPABASE_KEY = parseEnv('SUPABASE_ANON_KEY');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log("1. Fetching a sample FA translation to get a valid slug...");
    const { data: samples, error: sampleError } = await supabase
        .from('recipe_translations')
        .select('title, recipe_id')
        .eq('language', 'fa')
        .limit(1);

    if (sampleError || !samples || samples.length === 0) {
        console.error("Failed to get samples:", sampleError);
        return;
    }

    const sample = samples[0];
    console.log("Sample:", sample);
    const slug = sample.title.replace(/\s+/g, '-');
    console.log("Constructed Slug:", slug);
    const normalizedTitle = decodeURIComponent(slug).replace(/-/g, ' ');
    console.log("Normalized Title for Query:", normalizedTitle);

    console.log("\n2. Attempting the problematic query (Relation Filter)...");
    const { data: recipe, error } = await supabase
        .from('recipes')
        .select('*, recipe_translations!inner(*)')
        .eq('recipe_translations.title', normalizedTitle)
        .eq('recipe_translations.language', 'fa');

    if (error) {
        console.error("❌ Link Query Error:", error);
    } else {
        console.log("✅ Link Query Success (Rows):", recipe?.length);
        if (recipe?.length > 0) console.log("First row ID:", recipe[0].id);
    }

    console.log("\n3. Attempting alternative query (Two-step via translations)...");
    const { data: translation, error: tError } = await supabase
        .from('recipe_translations')
        .select('recipe_id')
        .eq('title', normalizedTitle)
        .eq('language', 'fa')
        .single();

    if (tError) {
        console.error("❌ Translation Lookup Error:", tError);
    } else {
        console.log("✅ Found Recipe ID:", translation.recipe_id);
        const { data: finalRecipe, error: rError } = await supabase
            .from('recipes')
            .select('*, recipe_translations(*)')
            .eq('id', translation.recipe_id)
            .single();

        if (rError) {
            console.error("❌ Final Recipe Fetch Error:", rError);
        } else {
            console.log("✅ Final Recipe Fetched:", finalRecipe.id);
            console.log("Translations count:", finalRecipe.recipe_translations.length);
        }
    }
}

run();
