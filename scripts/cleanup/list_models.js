const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const keyMatch = envContent.match(/GOOGLE_API_KEY=(.*)/);
const key = keyMatch ? keyMatch[1].trim() : '';

async function list() {
    console.log('Listing models with key:', key.slice(0, 5) + '...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.models) {
            console.log('Available Models:');
            data.models.forEach(m => {
                if (m.name.includes('gemini')) console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log('Error/No models:', data);
        }
    } catch (e) {
        console.error(e);
    }
}
list();
