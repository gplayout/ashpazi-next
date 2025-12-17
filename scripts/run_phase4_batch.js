
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function runBatch() {
    const secret = process.env.NEXT_PUBLIC_PIPELINE_SECRET;
    const ingestUrl = `http://localhost:3000/api/pipeline/ingest?secret=${secret}`;
    const transUrl = `http://localhost:3000/api/pipeline/translate?secret=${secret}`;

    console.log("🚀 Starting Phase 4 Data Collection Batch...");

    // 1. Run Ingest 3 times (approx 30 items if batch size 10)
    for (let i = 1; i <= 3; i++) {
        console.log(`\n📥 Ingestion Batch ${i}/3...`);
        try {
            const res = await fetch(ingestUrl);
            const json = await res.json();
            console.log(`Status: ${res.status}`, JSON.stringify(json.summary || json));
            await new Promise(r => setTimeout(r, 2000)); // wait 2s
        } catch (e) {
            console.error("Ingest failed:", e.message);
        }
    }

    // 2. Run Translate 3 times
    for (let i = 1; i <= 3; i++) {
        console.log(`\n🗣️ Translation Batch ${i}/3...`);
        try {
            const res = await fetch(transUrl);
            const json = await res.json();
            console.log(`Status: ${res.status}`, JSON.stringify(json.summary || json));
            await new Promise(r => setTimeout(r, 5000)); // wait 5s for rate limits
        } catch (e) {
            console.error("Translate failed:", e.message);
        }
    }

    console.log("\n✅ Batch Complete.");
}

runBatch();
