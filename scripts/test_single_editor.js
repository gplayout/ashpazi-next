
const { createClient } = require('@supabase/supabase-js');
const RecipeEditorPro = require('../src/lib/ai/RecipeEditorPro');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSingle() {
    const TEST_ID = 250;
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

    console.log(`🧪 STARTING SINGLE RECIPE TEST (ID: ${TEST_ID})`);

    // 1. Fetch Raw Data
    const { data: recipe, error } = await supabase
        .from('recipes')
        .select('id, name_en, ingredients_en, instructions_en')
        .eq('id', TEST_ID)
        .single();

    if (error || !recipe) {
        console.error("❌ Failed to fetch recipe 250:", error);
        return;
    }

    console.log(`📋 Input: ${recipe.name_en}`);

    const rawText = `
    Name: ${recipe.name_en}
    Ingredients: ${JSON.stringify(recipe.ingredients_en)}
    Instructions: ${JSON.stringify(recipe.instructions_en)}
    `;

    // 2. Generate
    const agent = new RecipeEditorPro(apiKey);
    console.log("🤖 Generating AI Content (English, Farsi, Spanish)...");

    const result = await agent.process(rawText);

    if (result.status === "error") {
        console.error("❌ AI Error:", result.message);
        return;
    }

    // 3. Output Results
    console.log("\n✅ GENERATION COMPLETE!");

    const output = result.output;

    console.log("\n🇬🇧 ENGLISH PREVIEW:");
    console.log("Title:", output.english.name);
    console.log("Desc:", output.english.description);
    console.log("Health:", output.english.health_benefits);

    console.log("\n🇮🇷 FARSI PREVIEW:");
    console.log("Title:", output.persian.name);
    console.log("Desc:", output.persian.description);
    console.log("Health:", output.persian.health_benefits);

    // Save strict JSON for review
    fs.writeFileSync('test_output_250.json', JSON.stringify(output, null, 2));
    console.log("\n💾 Full JSON saved to 'test_output_250.json'");
}

testSingle();
