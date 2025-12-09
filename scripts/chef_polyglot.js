const { createClient } = require('@supabase/supabase-js');
const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');

// 1. Language Configuration
const TARGET_LANG = process.argv[2] || 'es'; // Default to Spanish
// Maps for strict cultural context prompts
const LANG_CONTEXT = {
    'es': "Spanish (Spain/Latin America). Explain exotic ingredients (e.g., 'Limoo Amani' -> 'Limón seco persa, aporta acidez cítrica profunda').",
    'fr': "French. Focus on culinary technique terms.",
    'de': "German. Be precise with measurements and descriptions.",
    'it': "Italian. Relate flavors to Mediterranean equivalents.",
    'ja': "Japanese. Use polite form, explain texture (Mochi-mochi, etc).",
};

// 2. Load Keys
const envPath = path.resolve(__dirname, '../.env.local');
// If .env.local doesn't exist, try .env
const finalEnvPath = fs.existsSync(envPath) ? envPath : path.resolve(__dirname, '../.env');

let envContent = '';
try {
    envContent = fs.readFileSync(finalEnvPath, 'utf-8');
} catch (e) {
    console.error("Could not read .env file");
    process.exit(1);
}

const parseEnv = (key) => {
    // Try to match key=value or key="value"
    const match = envContent.match(new RegExp(`${key}=["']?(.*?)["']?$`, 'm'));
    return match ? match[1] : process.env[key];
};

const SUPABASE_URL = parseEnv('NEXT_PUBLIC_SUPABASE_URL') || parseEnv('VITE_SUPABASE_URL');
const SUPABASE_KEY = parseEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || parseEnv('VITE_SUPABASE_ANON_KEY');
const OPENAI_API_KEY = parseEnv('OPENAI_API_KEY') || parseEnv('VITE_OPENAI_API_KEY');

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
    console.error("Missing credentials. Check .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function run() {
    console.log(`👨‍🍳 Chef Polyglot initializing for language: ${TARGET_LANG.toUpperCase()}...`);

    // 1. Get Recipes that DON'T have this translation yet
    // Strategy: Fetch all recipes, then check if translation exists (or use a join if possible).
    // For simplicity & batching: Fetch strict batch of recipes, then check translations.

    // FETCH BATCH (Limit 5 for safety first run)
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .order('id', { ascending: true })
        .range(0, 1999); // Process up to 2000 recipes

    if (error) { console.error("Fetch Error:", error); return; }

    console.log(`Found ${recipes.length} candidates. Checking for existing ${TARGET_LANG} translations...`);

    for (const recipe of recipes) {
        await processRecipe(recipe);
    }
}

async function processRecipe(recipe) {
    // Check if translation exists
    const { data: existing, error: checkError } = await supabase
        .from('recipe_translations')
        .select('id')
        .eq('recipe_id', recipe.id)
        .eq('language', TARGET_LANG)
        .single();

    if (existing) {
        console.log(`   ⏭️  Skipping ${recipe.name} (Already translated)`);
        return;
    }

    console.log(`   🌍 Translating: "${recipe.name}" -> ${TARGET_LANG}`);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are Chef Polyglot, an expert culinary translator.
                    Task: Translate this Persian recipe into ${TARGET_LANG}.
                    Context: ${LANG_CONTEXT[TARGET_LANG] || "Translate conceptually, explaining exotic ingredients."}
                    
                    INPUT:
                    Name: ${recipe.name}
                    Ingredients: ${JSON.stringify(recipe.ingredients)}
                    Instructions: ${JSON.stringify(recipe.instructions)}

                    OUTPUT JSON:
                    {
                        "title": "Translated Name (Original Transliterated)",
                        "ingredients": ["Translated line 1", "Translated line 2 with explanation"],
                        "instructions": ["Translated step 1", "Translated step 2"]
                    }`
                }
            ],
            response_format: { type: "json_object" }
        });

        const translated = JSON.parse(response.choices[0].message.content);

        // Insert into DB
        const { error: insertError } = await supabase
            .from('recipe_translations')
            .insert({
                recipe_id: recipe.id,
                language: TARGET_LANG,
                title: translated.title,
                ingredients: translated.ingredients,
                instructions: translated.instructions
            });

        if (insertError) {
            console.error(`   ❌ Insert Failed: ${insertError.message}`);
        } else {
            console.log(`   ✅ Saved: ${translated.title}`);
        }

    } catch (e) {
        console.error(`   ⚠️  AI/Net Error for ${recipe.id}:`, e.message);
    }
}

run();
