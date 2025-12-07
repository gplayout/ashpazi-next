const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");

// Manually parse .env to avoid dependency/flag issues
try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8');
        envConfig.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                let key = parts[0].trim();
                // Skip comments
                if (key.startsWith('#')) return;

                const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
        console.log("✅ .env loaded manually. Keys present:", Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('OPENAI')));
    } else {
        console.warn("⚠️ .env file not found at:", envPath);
    }
} catch (e) {
    console.error("Error loading .env:", e);
}

// Load env vars with fallbacks
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!OPENAI_API_KEY) {
    console.error("❌ Missing OPENAI_API_KEY");
    console.log("Current Env Keys:", Object.keys(process.env).sort());
    process.exit(1);
}
if (!SUPABASE_URL) {
    console.error("❌ Missing SUPABASE_URL");
    console.log("Current Env Keys:", Object.keys(process.env).filter(k => k.includes("URL")));
    process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Hardcoded Reference for POC (Kookoo Sabzi from Persian Mama)
const REFERENCE_IMAGE_URL = "https://persianmama.com/wp-content/uploads/2014/11/kukusabzi-fbb.jpg";
const DISH_NAME = "Kookoo Sabzi (Persian Herb Frittata)";

async function generateWithReference() {
    console.log(`\n🧪 Starting Reference Agent Test for: ${DISH_NAME}`);
    console.log(`Unknown Dish? No! Asking 'The Analyst' to look at: ${REFERENCE_IMAGE_URL}`);

    // Step 1: Vision Analysis
    console.log("\n👀 Phase 1: The Analyst (GPT-4o Vision)...");

    try {
        const visionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "You are an expert Persian cuisine photographer. Analyze this photo of 'Kookoo Sabzi' in specific culinary detail. \n\nCRITICAL: Pay close attention to the garnish. Identify 'Zereshk' (Barberries) - these are small, ruby-red, tart dried berries, NOT red peppers or tomatoes. Identify 'Gerdo' (Walnuts) - crunchy, textured nuts. \n\nDescribe the lighting, textures (crispy herb crust, fluffy green interior), and the exact nature of the garnish (Barberries & Walnuts). Output a comprehensive visual description for DALL-E 3. \n\nNEGATIVE PROMPT INSTRUCTIONS: Explicitly state that there are NO red peppers, chili flakes, or tomatoes. The red dots are BARBERRIES." },
                        {
                            type: "image_url",
                            image_url: {
                                "url": REFERENCE_IMAGE_URL,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 500,
        });

        const analysis = visionResponse.choices[0].message.content;
        console.log(`\n📋 Visual Spec (from Analyst):\n"${analysis}"`);

        // Step 2: Image Generation
        console.log("\n📸 Phase 2: The Photographer (DALL-E 3)...");

        // We append the analysis to a strong base prompt
        // Explicitly forcing Zereshk and Walnuts in the final prompt as well to double-down on the user requirement
        const finalPrompt = `A photorealistic food photography shot of ${DISH_NAME}. ${analysis}. Garnish: Vibrant ruby-red Barberries (Zereshk) and golden Walnuts on top. NO peppers. Shot on a high-end Sony A7R IV with a 50mm f/1.8 GM lens. Hyper-realistic, 8k resolution, natural window light.`;

        console.log(`\n🚀 Sending Prompt to Camera:\n"${finalPrompt}"`);

        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: finalPrompt,
            n: 1,
            size: "1024x1024",
            quality: "hd",
            style: "natural",
        });

        const imageUrl = imageResponse.data[0].url;
        console.log(`\n✅ Image Captured! View at:\n${imageUrl}`);

        // Optional: Upload to Supabase to persist
        console.log("\n💾 Saving to Darkroom (Supabase)...");
        const imageBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer());
        const timestamp = Date.now();
        const fileName = `test-reference-agent-${timestamp}.png`;

        // Check if bucket exists, if not create logic is outside scope for now (it exists from previous step)

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("recipe-images")
            .upload(fileName, imageBuffer, {
                contentType: "image/png",
                upsert: true,
            });

        if (uploadError) {
            console.error("Upload failed:", uploadError);
        } else {
            const publicUrl = supabase.storage.from("recipe-images").getPublicUrl(fileName).data.publicUrl;
            console.log(`\n🎉 Final Developed Photo: ${publicUrl}`);
        }

    } catch (error) {
        console.error("❌ Error in Reference Agent pipeline:", error);
    }
}

generateWithReference();
