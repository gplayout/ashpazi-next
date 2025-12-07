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
const OPENAI_API_KEY = "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";

        .from('recipes')
    .select('*')
    .order('id', { ascending: true })
    .range(0, 2000);

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
                    content: `You are a Grand Master Chef and Culinary Historian specializing in the Persianate world (Iran, Afghanistan, Tajikistan).
                    Task: Revise this recipe metadata to be culturally accurate, professional, and appetizing.
                    
                    Rules:
                    1. **Name**: Format as "Farsi Name (English Name)". Example: "Ghormeh Sabzi (Persian Herb Stew)".
                    2. **Instructions**: Clean up the text. Remove any "posted by" or generic blog fluff. Keep it purely instructional and professional.
                    3. **Authenticity**: If it's an Afghan dish (e.g. Qabili Palau) or Tajik dish, respect its origin.
                    
                    Input JSON: { name, ingredients, instructions (if available) }
                    Output JSON: { name, ingredients (array), description (short appetizing summary) }`
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
                name: refined.name,
                ingredients: refined.ingredients,
                // description: refined.description // We might not have this column, let's check schema. 
                // Assuming we only update name/ingredients for now to be safe, or if 'instructions' allows text update.
                // Let's stick to safe updates: Name & Ingredients are core.
            })
            .eq('id', recipe.id);

        if (!error) console.log(`   ✅ Polished: ${refined.name}`);
        else console.error(`   ❌ DB Error: ${error.message}`);

    } catch (e) {
        console.error(`   ⚠️ Edit Failed for ${recipe.id}:`, e.message);
    }
}

run();
