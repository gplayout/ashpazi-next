
const fetch = require('node-fetch'); // Needs node-fetch or use native fetch in Node 18+

async function testEndpoints() {
    console.log("🔍 Testing Local API Endpoints (http://localhost:3000)...");

    // 1. Voice API (Assistant)
    try {
        console.log("\n1️⃣  Testing /api/assistant...");
        const res = await fetch('http://localhost:3000/api/assistant', {
            method: 'POST',
            body: JSON.stringify({ message: "Hello", language: "en" })
        });
        if (res.ok) console.log("   ✅ Status 200 OK");
        else console.log(`   ❌ Status ${res.status}: ${await res.text()}`);
    } catch (e) { console.log(`   ❌ Connection Refused: ${e.message}`); }

    // 2. Nutrition API
    try {
        console.log("\n2️⃣  Testing /api/nutrition...");
        const res = await fetch('http://localhost:3000/api/nutrition', {
            method: 'POST',
            body: JSON.stringify({ ingredients: ["Egg"], language: "en" })
        });
        if (res.ok) console.log("   ✅ Status 200 OK");
        else console.log(`   ❌ Status ${res.status}: ${await res.text()}`);
    } catch (e) { console.log(`   ❌ Connection Refused: ${e.message}`); }

    console.log("\n--- Diagnosis ---");
    console.log("If these passed locally, but Vercel fails -> You accept Missing ENV VAR on Vercel.");
    console.log("If these failed locally -> The API code has a bug or .env.local isn't loading.");
}

testEndpoints();
