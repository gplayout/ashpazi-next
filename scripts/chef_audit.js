const { createClient } = require('@supabase/supabase-js');
const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');

// 1. Load Environment Variables
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const parseEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : null;
};

const SUPABASE_URL = parseEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = parseEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const SERPER_API_KEY = parseEnv('SERPER_API_KEY') || process.env.SERPER_API_KEY;
// Using provided key directly to bypass .env issues
const OPENAI_API_KEY = "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";

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY || !SERPER_API_KEY) {
    console.error("❌ Missing Keys in .env.local:");
    console.log("Supabase:", !!SUPABASE_URL);
        .order('id', { ascending: true }) // Deterministic order
        .range(500, 2000);

    if (error) {
        console.error("Fetch Error:", error);
        return;
    }

    console.log(`Phase 1: Auditing ${recipes.length} recipes...`);

    for (const recipe of recipes) {
        await auditRecipe(recipe);
    }
}

async function auditRecipe(recipe) {
    console.log(`\n🍲 Auditing: "${recipe.name}" (${recipe.id})`);

    // --- STEP 1: TEXT AUDIT (GPT-4o) ---
    // Rewrite content to be professional
    let cleanName = recipe.name;
    let cleanIngredients = recipe.ingredients;

    try {
        const textResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a world-class Persian Chef and Food Editor. 
                    Mission: Professionalize the recipe metadata.
                    1. Name: Correct English/Farsi spelling. Format: "Farsi Name (English Name)".
                    2. Ingredients: Format as a clean JSON list.
                    3. Tone: Authentic, appetizing, high-end.
                    Output JSON only: { "name": "...", "ingredients": [...] }`
                },
                {
                    role: "user",
                    content: `Rough Data: Name: ${recipe.name}, Ingredients: ${JSON.stringify(recipe.ingredients)}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const refined = JSON.parse(textResponse.choices[0].message.content);
        cleanName = refined.name;
        cleanIngredients = refined.ingredients;
        console.log(`   📝 Text: Rewritten as "${cleanName}"`);
    } catch (e) {
        console.error("   ⚠️ Text Audit Failed:", e.message);
    }

    // --- STEP 2: IMAGE AUDIT (Vision) ---
    // Check if image exists and is valid
    let imageUrl = recipe.image;
    let imageNeedsReplace = false;

    if (!imageUrl) {
        console.log("   📸 Image: MISSING. Queuing replacement.");
        imageNeedsReplace = true;
    } else {
        try {
            const visionResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a food critic. verify if the image EXACTLY matches the dish name. If it is high quality, return 'PASS'. If it is a generic placeholder, blurry, text-heavy, or WRONG food, return 'FAIL'."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: `Dish Name: ${cleanName}` },
                            { type: "image_url", image_url: { url: imageUrl } }
                        ]
                    }
                ],
                max_tokens: 10
            });

            const verdict = visionResponse.choices[0].message.content;
            if (verdict.includes("FAIL")) {
                console.log("   📸 Image: REJECTED by Chef (Quality/Match issue).");
                imageNeedsReplace = true;
            } else {
                console.log("   📸 Image: PASSED.");
            }
        } catch (e) {
            console.error("   ⚠️ Vision Audit Failed (likely invalid URL):", e.message);
            imageNeedsReplace = true;
        }
    }

    // --- STEP 3: REPLACEMENT (Serper) ---
    if (imageNeedsReplace) {
        const newImage = await findImage(cleanName);
        if (newImage) {
            imageUrl = await uploadImage(newImage, recipe.id);
            console.log("   ✨ Image: Replaced with new authentic finding.");
        }
    }

    // --- STEP 4: SAVE ---
    // Update DB with cleaned text and potential new image
    const { error: updateError } = await supabase
        .from('recipes')
        .update({
            name: cleanName,
            ingredients: cleanIngredients,
            image: imageUrl,
            // Add a flag 'audited: true' if we had that column, but we don't.
        })
        .eq('id', recipe.id);

    if (updateError) console.error("   ❌ Save Failed:", updateError.message);
    else console.log("   ✅ Recipe Updated Successfully.");
}

// Reuse Serper Logic
async function findImage(queryName) {
    const query = `Authentic Persian food ${queryName} food photography`;
    try {
        const res = await fetch('https://google.serper.dev/images', {
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: query })
        });
        const data = await res.json();
        if (data.images && data.images.length > 0) return data.images[0].imageUrl;
    } catch (e) { }
    return null;
}

// Reuse Upload Logic
async function uploadImage(url, recipeId) {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const ext = contentType.split('/')[1] || 'jpg';
        const fileName = `chef-audit/${recipeId}-${Date.now()}.${ext}`;

        await supabase.storage.from('recipe-images').upload(fileName, buffer, { contentType, upsert: true });
        const { data } = supabase.storage.from('recipe-images').getPublicUrl(fileName);
        return data.publicUrl;
    } catch (e) { return null; }
}

run();
