require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function runTest() {
    const secret = process.env.NEXT_PUBLIC_PIPELINE_SECRET;
    const url = `http://localhost:3000/api/pipeline/ingest?secret=${secret}`;

    console.log(`Calling: ${url}`);

    try {
        const res = await fetch(url);
        const json = await res.json();
        console.log('API Response:', JSON.stringify(json, null, 2));
    } catch (err) {
        console.error('API Fail:', err);
    }
}

runTest();
