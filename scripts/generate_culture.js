
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const { search, SafeSearchType } = require('duck-duck-scrape');
require('dotenv').config({ path: '.env.local' });

// Config
const COUNTRY = process.argv[2] || 'Italy';
const COUNT = process.argv[3] || 5; // Default batch size
const DELAY_MS = 2000;

// Init OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
});

// Init Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: Delay
const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
    console.log(`🌍 Starting Global Recipe Generator for: ${COUNTRY} (${COUNT} recipes)`);

    // 1. Generate List of Dishes
    console.log(`📋 Generating list of top ${COUNT} authentic dishes...`);
    const listPrompt = `
    List top ${COUNT} distinct, authentic, traditional dishes from ${COUNTRY}.
    Return ONLY a JSON array of strings (Dish Names in English). 
    Example: ["Pizza Margherita", "Risotto"]
    `;

    const listCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: listPrompt }],
        response_format: { type: "json_object" }
    });

    // Handle potential wrapper keys like { "dishes": [...] } or just array
    const rawList = listCompletion.choices[0].message.content;
    let dishList = [];
    try {
        const parsed = JSON.parse(rawList);
        dishList = Array.isArray(parsed) ? parsed : (parsed.dishes || parsed.list || Object.values(parsed)[0]);
    } catch (e) {
        console.error("Failed to parse list:", rawList);
        return;
    }

    console.log(`✅ Found ${dishList.length} dishes:`, dishList);

    // 2. Loop and Generate Content
    for (const dishName of dishList) {
        console.log(`\n👨‍🍳 Cooking up: ${dishName}...`);

        // Check if exists
        const { data: existing } = await supabase
            .from('recipes')
            .select('id')
            .ilike('name_en', dishName)
            .maybeSingle();

        if (existing) {
            console.log(`⏩ Skipping ${dishName} (Already exists)`);
            continue;
        }

        try {
            // A. Generate Full Data
            const data = await generateRecipeData(dishName);

            // B. Find Image
            const imageUrl = await findImage(dishName);

            // C. Insert to DB
            await insertToDB(data, imageUrl);

            // Limit rate
            await delay(DELAY_MS);

        } catch (err) {
            console.error(`❌ Error processing ${dishName}:`, err.message);
        }
    }

    console.log("\n🎉 Mission Accomplished! Bon Appétit.");
}

async function findImage(dishName) {
    try {
        const query = `${dishName} food photography high quality`;
        const results = await search(query, {
            safeSearch: SafeSearchType.MODERATE
        });

        // Return first high-res image if possible, DuckDuckScrape structure varies
        // results.images is often the array
        if (results.images && results.images.length > 0) {
            return results.images[0].url; // The direct image URL
        }
        return null;
    } catch (e) {
        console.warn("⚠️ Image search failed:", e.message);
        return null;
    }
}

async function generateRecipeData(dishName) {
    const prompt = `
    You are an expert ${COUNTRY} chef.
    Create a complete recipe for: "${dishName}".
    
    OUTPUT JSON SCHEMA (Strictly follow this):
    {
        "en": { "title": "...", "ingredients": ["..."], "instructions": ["..."] },
        "fa": { "title": "...", "ingredients": ["..."], "instructions": ["..."] },
        "es": { "title": "...", "ingredients": ["..."], "instructions": ["..."] },
        "nutrition": { "calories": 500, "protein": "20g", "carbs": "50g", "fat": "15g" },
        "info": { "prep_time": 30, "difficulty": "Medium" (Hard/Medium/Easy) }
    }

    Rules:
    - Translations must be native and natural.
    - Farsi: Use Polite Standard Persian.
    - Spanish: Use Mexican Spanish.
    - Ingredients: Array of strings.
    - Instructions: Array of strings (steps).
    `;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
}

async function insertToDB(data, imageUrl) {
    // 1. Prepare Main Record
    // Defaulting to Farsi for 'name', 'ingredients', 'instructions' to match existing schema

    // Nutrition Info Object Structure
    const nutritionInfo = {
        en: {
            calories: data.nutrition.calories,
            macro_nutrients: data.nutrition,
            chef_insight: `A classic ${COUNTRY} dish. ${data.en.instructions[0].slice(0, 50)}...`,
            health_benefits: ["Authentic ingredients", "Balanced meal"]
        },
        fa: {
            calories: data.nutrition.calories,
            macro_nutrients: data.nutrition,
            chef_insight: `یک غذای اصیل از ${COUNTRY}.`,
            health_benefits: ["مواد اولیه تازه", "وعده غذایی کامل"]
        },
        es: {
            calories: data.nutrition.calories,
            macro_nutrients: data.nutrition,
            chef_insight: `Un plato clásico de ${COUNTRY}.`,
            health_benefits: ["Ingredientes auténticos", "Comida equilibrada"]
        }
    };

    const recipePayload = {
        name: data.fa.title, // Farsi is default 'name'
        name_en: data.en.title,
        ingredients: data.fa.ingredients,
        instructions: data.fa.instructions,
        ingredients_en: data.en.ingredients,
        instructions_en: data.en.instructions,
        category: COUNTRY,
        prep_time_minutes: data.info.prep_time,
        difficulty: data.info.difficulty,
        calories: data.nutrition.calories,
        image: imageUrl,
        nutrition_info: nutritionInfo
    };

    const { data: inserted, error } = await supabase
        .from('recipes')
        .insert(recipePayload)
        .select()
        .single();

    if (error) throw new Error(`DB Insert Error: ${error.message}`);

    const recipeId = inserted.id;

    // 2. Prepare Translations
    const translations = [
        { recipe_id: recipeId, language: 'en', title: data.en.title, ingredients: data.en.ingredients, instructions: data.en.instructions },
        { recipe_id: recipeId, language: 'fa', title: data.fa.title, ingredients: data.fa.ingredients, instructions: data.fa.instructions },
        { recipe_id: recipeId, language: 'es', title: data.es.title, ingredients: data.es.ingredients, instructions: data.es.instructions }
    ];

    const { error: transError } = await supabase
        .from('recipe_translations')
        .insert(translations);

    if (transError) console.warn(`⚠️ Translation insert error for ${data.en.title}:`, transError.message);
    else console.log(`   ✅ Saved: ${data.en.title} (ID: ${recipeId})`);
}

main();
