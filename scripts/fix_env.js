
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');

    // Check if OPENAI_API_KEY is missing but VITE_ is present
    if (!content.includes('OPENAI_API_KEY=') && content.includes('VITE_OPENAI_API_KEY=')) {
        const match = content.match(/VITE_OPENAI_API_KEY=(.*)/);
        if (match) {
            const key = match[1].trim();
            content += `\nOPENAI_API_KEY=${key}\n`;
            fs.writeFileSync(envPath, content);
            console.log("✅ Fixed .env.local: Added OPENAI_API_KEY");
        }
    } else {
        console.log("ℹ️ .env.local seems fine or VITE key missing.");
    }
} else {
    console.error("❌ .env.local not found");
}
