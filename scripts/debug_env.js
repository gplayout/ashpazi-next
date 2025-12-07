const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
try {
    const envContent = fs.readFileSync(envPath, 'utf-8');

    const lines = envContent.split('\n');
    console.log("--- .env.local content analysis ---");
    lines.forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) {
            const masked = val.trim().substring(0, 7) + '...' + val.trim().slice(-4);
            console.log(`${key.trim()}: ${masked}`);
        }
    });

    console.log("\n--- Script Parsing Logic Check ---");
    const parseEnv = (key) => {
        const match = envContent.match(new RegExp(`${key}=(.*)`));
        return match ? match[1] : null;
    };

    const openAI = parseEnv('OPENAI_API_KEY');
    const viteOpenAI = parseEnv('VITE_OPENAI_API_KEY');

    console.log(`Parsed OPENAI_API_KEY: ${openAI ? openAI.substring(0, 7) + '...' : 'NULL'}`);
    console.log(`Parsed VITE_OPENAI_API_KEY: ${viteOpenAI ? viteOpenAI.substring(0, 7) + '...' : 'NULL'}`);

} catch (e) {
    console.error("Error reading .env.local:", e);
}
