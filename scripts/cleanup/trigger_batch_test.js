const fetch = require('node-fetch');

const SECRET = 'pipeline_secret_777';

async function runBatch() {
    console.log('Running single batch (5 items) with Gemini 3...');
    const url = `http://localhost:3000/api/pipeline/translate?secret=${SECRET}&lang=en&offset=0`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log('Batch Result:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

runBatch();
