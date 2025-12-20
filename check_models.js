const fetch = require('node-fetch'); // Assuming node env has fetch (v18+) or I'll use https
// Actually, in modern node fetch is global.

async function checkModels() {
    const key = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found in env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    console.log("Fetching models from:", url.replace(key, 'HIDDEN'));

    try {
        const res = await fetch(url);
        const json = await res.json();

        if (json.models) {
            console.log("Available Models:");
            json.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name} (${m.supportedGenerationMethods})`);
                }
            });
        } else {
            console.log("Error:", json);
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

// Load env
require('dotenv').config({ path: '.env.local' });
checkModels();
