const { createClient } = require('@supabase/supabase-js');
const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');

// 1. Load Keys (Hardcoded for stability based on session history)
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const parseEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : null;
};

const SUPABASE_URL = parseEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = parseEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
// Using the working key provided by user
const OPENAI_API_KEY = parseEnv('OPENAI_API_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function run() {
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .order('id', { ascending: true })
        .range(1000, 2999); // Phase 2: Resume from 1000

    if (error) { console.error(error); return; }

    console.log(`Auditing TEXT for ${recipes.length} recipes with Cultural Expertise...`);

    // Process in parallel chunks of 5 for speed (Text is faster than image)
    const chunkSize = 5;
    for (let i = 0; i < recipes.length; i += chunkSize) {
        const chunk = recipes.slice(i, i + chunkSize);
        await Promise.all(chunk.map(processRecipe));
    }
}

async function processRecipe(recipe) {
    // console.log(`   📖 Reading: "${recipe.name}"`);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a Grand Master Chef and Culinary Historian specializing in the Persianate world.
                    Task: Revise and STRUCTURIZE this recipe for a BILINGUAL database (Strict Farsi vs Strict English).
                    
                    INPUT ISSUES: Data is messy, mixed languages, or raw text blocks.
                    
                    REQUIREMENTS:
                    1. **Farsi Version (Strict)**: 
                       - Name: Pure Farsi (e.g., "قورمه سبزی"). NO English characters.
                       - Ingredients/Instructions: Pure Farsi.
                    2. **English Version (Strict)**: 
                       - Name: English Name + (Transliterated Name). e.g., "Persian Herb Stew (Ghormeh Sabzi)".
                       - Cultural Adaptation: Explain ingredients like an American food writer would (e.g., "Dried Limes (Limoo Amani) - adds a sour punch").
                       - NO Farsi characters in English fields.
                    
                    OUTPUT JSON:
                    { 
                      name_fa, 
                      name_en, 
                      ingredients_fa (array), 
                      ingredients_en (array),
                      instructions_fa (array),
                      instructions_en (array)
                    }`
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        name: recipe.name,
                        ingredients: recipe.ingredients,
                        instructions: recipe.instructions // passing instructions for context if needed
                    })
                }
            ],
            response_format: { type: "json_object" }
        });

        const refined = JSON.parse(response.choices[0].message.content);

        // Update DB
        const { error } = await supabase
            .from('recipes')
            .update({
                name: refined.name_fa, // Default column becomes Strict Farsi
                name_en: refined.name_en,

                ingredients: refined.ingredients_fa, // Default column becomes Strict Farsi
                ingredients_en: refined.ingredients_en,

                instructions: refined.instructions_fa, // Default column becomes Strict Farsi
                instructions_en: refined.instructions_en
            })
            .eq('id', recipe.id);

        if (!error) console.log(`   ✅ Polished: ${refined.name}`);
        else console.error(`   ❌ DB Error: ${error.message}`);

    } catch (e) {
        console.error(`   ⚠️ Edit Failed for ${recipe.id}:`, e.message);
    }
}

run();
