
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function runPilot() {
    const secret = process.env.NEXT_PUBLIC_PIPELINE_SECRET;
    const url = `http://localhost:3000/api/pipeline/translate?secret=${secret}`;

    console.log(`🚀 Triggering Translation Pilot...`);

    try {
        const res = await fetch(url);
        const data = await res.json();

        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.ok && data.summary) {
            console.log(`\n✅ Success: ${data.summary.success}`);
            console.log(`❌ Failed: ${data.summary.failed}`);
            if (data.summary.success === 0 && data.summary.failed === 0) {
                console.log("No pending recipes found (normalized_ok).");
            }
        }
    } catch (e) {
        console.error("Failed to call API:", e);
    }
}

runPilot();
