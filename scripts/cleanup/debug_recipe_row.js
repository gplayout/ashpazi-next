
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get ID from args
const recipeId = process.argv[2];

if (!recipeId) {
    console.log("Please provide a Legacy Recipe ID (e.g. 790)");
    process.exit(1);
}

console.log(`🔎 Debugging Legacy ID: ${recipeId}`);

// 1. Get Registry Entry
const { data: reg, error: regError } = await supabase
    .from('registry_recipes')
    .select('id')
    .eq('legacy_recipe_id', recipeId)
    .single();

if (regError || !reg) {
    console.log("❌ NO Registry Entry Found. Migration skipped this?");
    console.log(regError);
    process.exit();
}

console.log(`✅ Found Registry UUID: ${reg.id}`);

// 2. Get Translation
const { data: trans, error: transError } = await supabase
    .from('content_translations')
    .select('title, qa_metadata')
    .eq('recipe_id', reg.id)
    .eq('language_code', 'en')
    .single();

if (transError || !trans) {
    console.log("❌ NO English Translation Found in content_translations.");
    console.log(transError);
} else {
    console.log(`✅ Found Translation: "${trans.title}"`);
    console.log("--- QA METADATA SNAPSHOT ---");
    // Print just the keys to see if 'story', 'chef_guide' exist
    if (trans.qa_metadata) {
        console.log("Keys:", Object.keys(trans.qa_metadata));
        console.log("Story:", trans.qa_metadata.origin_history ? "✅ EXISTS" : "❌ MISSING");
        console.log("Chef Guide:", trans.qa_metadata.chef_guide ? "✅ EXISTS" : "❌ MISSING");
        console.log("Timers Removed?", "N/A (Frontend responsibility)");
    } else {
        console.log("⚠️ qa_metadata is NULL");
    }
}
