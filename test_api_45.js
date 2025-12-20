
require('dotenv').config({ path: '.env.local' });

const API_URL = 'http://localhost:3000/api/pipeline/translate';
const SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';

async function testApi45() {
    console.log("⚡ TESTING ID 45 (French)...");
    const id = 45;

    // Call with specific ID (Targeted Mode)
    const res = await fetch(`${API_URL}?secret=${SECRET}&lang=fr&id=${id}`);
    const json = await res.json();

    console.log("Response:", JSON.stringify(json, null, 2));
}

testApi45();
