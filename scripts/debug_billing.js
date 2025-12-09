const OpenAI = require("openai");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function testGen() {
    console.log("--- Testing OpenAI Image Generation (Billing Check) ---");
    console.log("Key starting with:", OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 8) + "..." : "NONE");

    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: "A simple red apple on a wooden table. Professional photography.",
            n: 1,
            size: "1024x1024",
            quality: "standard"
        });
        console.log("✅ SUCCESS! Image generated.");
        console.log("URL:", response.data[0].url);
    } catch (e) {
        console.error("❌ FAILED.");
        console.error("Type:", e.type);
        console.error("Code:", e.code);
        console.error("Param:", e.param);
        console.error("Message:", e.message);

        if (e.message.includes("Billing hard limit")) {
            console.log("\n⚠️ DIAGNOSIS: The 'Billing Hard Limit' is active. Using more credits requires increasing the usage limit in settings, not just adding funds.");
        }
    }
}

testGen();
