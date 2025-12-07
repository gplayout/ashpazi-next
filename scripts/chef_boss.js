const { createClient } = require('@supabase/supabase-js');
const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');

// 1. Load Keys 
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const parseEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : null;
};

const SUPABASE_URL = parseEnv('NEXT_PUBLIC_SUPABASE_URL');
        .from('recipes')
    .select('*')
    .order('id', { ascending: true })
    .range(0, 2000);

if (error) { console.error(error); return; }

console.log(`Auditing ${recipes.length} recipes with SUPREME STRICTNESS...`);

// Chunky processing
const chunkSize = 3; // Slower, more careful
for (let i = 0; i < recipes.length; i += chunkSize) {
    const chunk = recipes.slice(i, i + chunkSize);
    await Promise.all(chunk.map(processRecipe));
}
}

async function processRecipe(recipe) {
    const systemPrompt = `You are the Executive Chef & Brand Manager of a Michelin-star Persian Restaurant.

    **YOUR MISSION:**
    Fix broken/lazy recipes. 

    **CRITICAL RULES:**
    1. **CONSISTENCY CHECK**: If 'Ingredients' list says "2 Eggs" but 'Instructions' text says "Add 4 eggs", YOU MUST FIX THE TEXT to match the ingredients list. The List is the Truth.
    2.  **INSTRUCTIONS REWRITE**: Convert lazy text blocks into PROPER NUMBERED STEPS. 
        - ❌ BAD: "Step 1: Mix everything and cook." (Too lazy)
        - ✅ GOOD: ["Step 1: Mix eggs and flour.", "Step 2: Heat the pan.", "Step 3: Cook for 10 mins."]
        - **SPLIT HUGE PARAGRAPHS**: If the input is one giant block, break it down by action (e.g. "Chopping", "Frying", "Boiling").
        - **MINIMUM STEPS**: A proper recipe usually has 4+ steps.
    3. **LANGUAGE**: Farsi (Persian).
    4. **TITLE**: "Farsi Name (English Name)".
    5. **DESCRIPTION**: Add a 1-sentence "Marketing Hook".

    **INPUT DATA**:
    Name: ${recipe.name}
    Ingredients: ${JSON.stringify(recipe.ingredients)}
    Instructions: ${JSON.stringify(recipe.instructions)}

    **OUTPUT JSON ONLY**:
    {
        "name": "...",
        "ingredients": ["..."],
        "instructions": ["Step 1...", "Step 2..."],
        "prep_time_minutes": 30,
        "difficulty": "Medium"
    }`;

    try {
        let refined = await generateRecipe(systemPrompt, "Fix this recipe perfectly.");

        // QA CHECK: Is it still one big clump?
        const totalLen = refined.instructions.join(' ').length;
        if (refined.instructions.length < 3 && totalLen > 200) {
            console.log(`   ⚠️ Text clump detected for ${recipe.name}. Kicking back to Chef...`);
            refined = await generateRecipe(systemPrompt, "CRITICAL ERROR: You returned 1 or 2 giant steps. YOU MUST SPLIT the instructions into at least 4-5 shorter, distinct steps.");
        }

        // Update DB
        const { error } = await supabase
            .from('recipes')
            .update({
                name: refined.name,
                ingredients: refined.ingredients,
                instructions: refined.instructions,
                prep_time_minutes: refined.prep_time_minutes,
                difficulty: refined.difficulty
            })
            .eq('id', recipe.id);

        if (!error) console.log(`   ✅ BOSS FIXED: ${refined.name} (${refined.instructions.length} steps)`);
        else console.error(`   ❌ DB Error: ${error.message}`);

    } catch (e) {
        console.error(`   ⚠️ Boss Failed for ${recipe.id}:`, e.message);
    }
}

async function generateRecipe(systemSys, userMsg) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemSys },
            { role: "user", content: userMsg }
        ],
        response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content);
}

run();
