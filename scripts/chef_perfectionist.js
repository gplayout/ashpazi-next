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
const SUPABASE_KEY = parseEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const SERPER_API_KEY = parseEnv('SERPER_API_KEY') || '28fcdced1f014a656a1aeab9d892902ec465be0b';
const OPENAI_API_KEY = "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";

        .from('recipes')
    .select('*')
    .order('id', { ascending: true })
    .range(0, 2000);

if (error) { console.error(error); return; }

console.log(`Auditing ${recipes.length} recipes with STRICT standards (Score 8+/10)...`);

for (const recipe of recipes) {
    await processRecipe(recipe);
}
}

async function processRecipe(recipe) {
    console.log(`\n🍲 Inspecting: "${recipe.name}" (${recipe.id})`);

    // 1. Vision Audit (Current Image)
    if (recipe.image) {
        const score = await scoreImage(recipe.name, recipe.image);
        console.log(`   👁️ Current Image Score: ${score}/10`);

        if (score >= 8) {
            console.log("   ✅ Excellent. Keeping it.");
            return;
        }
        console.log("   ❌ Rejected. Looking for better option...");
    } else {
        console.log("   ❌ Missing Image. Looking for options...");
    }

    // 2. Attempt: Real Search
    const realCandidateUrl = await findRealImage(recipe.name);
    if (realCandidateUrl) {
        const realScore = await scoreImage(recipe.name, realCandidateUrl);
        console.log(`   🔎 Found Real Candidate. Score: ${realScore}/10`);

        if (realScore >= 8) {
            console.log("   ✨ Success! Saving Real Image.");
            const savedUrl = await uploadImage(realCandidateUrl, recipe.id, 'real');
            if (savedUrl) await updateRecipe(recipe.id, savedUrl);
            return;
        }
        console.log("   ⚠️ Real image candidates were low quality.");
    }

    // 3. Attempt: AI Generation (Last Resort)
    console.log("   🎨 Generating AI Masterpiece (DALL-E 3)...");
    const aiImageUrl = await generateImage(recipe.name, recipe.ingredients);
    if (aiImageUrl) {
        console.log("   ✨ AI Image Generated. Saving...");
        const savedUrl = await uploadImage(aiImageUrl, recipe.id, 'ai');
        if (savedUrl) await updateRecipe(recipe.id, savedUrl);
    }
}

// --- HELPER FUNCTIONS ---

async function scoreImage(dishName, imageUrl) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text", text: `Rate this food photo for a high-end cookbook featuring "${dishName}". 
                        Criteria: 
                        1. Authentic to "${dishName}".
                        2. High Resolution & Sharp focus.
                        3. Appetizing lighting.
                        4. NO Text overlays.
                        Return ONLY a single number 0-10.` },
                        { type: "image_url", image_url: { url: imageUrl } }
                    ]
                }
            ],
            max_tokens: 10
        });
        const text = response.choices[0].message.content;
        const score = parseInt(text.match(/\d+/)?.[0] || "0");
        return score;
    } catch (e) {
        return 0; // Error = Fail
    }
}

async function findRealImage(queryName) {
    const query = `Authentic Persian food ${queryName} close up professional photography`;
    try {
        const res = await fetch('https://google.serper.dev/images', {
            method: 'POST',
            headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: query })
        });
        const data = await res.json();
        // Return first valid result? Or check top 3?
        // Let's just return the 1st one for now to check score.
        if (data.images && data.images.length > 0) return data.images[0].imageUrl;
    } catch (e) { }
    return null;
}

async function generateImage(dishName, ingredients) {
    try {
        // Construct a rich prompt
        const prompt = `Professional food photography of Authentic Persian ${dishName}. 
        Ingredients visible: ${JSON.stringify(ingredients).slice(0, 100)}.
        Style: Michelin star plating, macro shot, natural sunlight, 8k resolution, shallow depth of field. 
        NO text, NO watermark. Hyper-realistic.`;

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json",
            quality: "hd"
        });

        return response.data[0].b64_json;
    } catch (e) {
        console.error("   ⚠️ AI Gen Failed:", e.message);
        return null;
    }
}

async function uploadImage(source, recipeId, type) {
    try {
        let buffer, contentType;

        if (type === 'real') {
            const res = await fetch(source);
            if (!res.ok) return null;
            buffer = await res.arrayBuffer();
            contentType = res.headers.get('content-type') || 'image/jpeg';
        } else {
            // AI is base64
            buffer = Buffer.from(source, 'base64');
            contentType = 'image/png';
        }

        const ext = contentType.split('/')[1] || 'png';
        const fileName = `perfectionist/${recipeId}-${Date.now()}.${ext}`;

        await supabase.storage.from('recipe-images').upload(fileName, buffer, { contentType, upsert: true });
        const { data } = supabase.storage.from('recipe-images').getPublicUrl(fileName);
        return data.publicUrl;
    } catch (e) {
        console.error("   ⚠️ Upload Failed:", e.message);
        return null;
    }
}

async function updateRecipe(id, url) {
    await supabase.from('recipes').update({ image: url }).eq('id', id);
    console.log("   💾 DB Updated.");
}

run();
