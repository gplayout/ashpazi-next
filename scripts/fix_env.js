const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const localEnvPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf-8');
    let newContent = content;

    // Append NEXT_PUBLIC versions if they don't exist
    if (!content.includes('NEXT_PUBLIC_SUPABASE_URL') && content.includes('VITE_SUPABASE_URL')) {
        const urlVal = content.match(/VITE_SUPABASE_URL=(.*)/)[1];
        newContent += `\nNEXT_PUBLIC_SUPABASE_URL=${urlVal}`;
    }

    if (!content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY') && content.includes('VITE_SUPABASE_ANON_KEY')) {
        const keyVal = content.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
        newContent += `\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${keyVal}`;
    }

    // Also ensure OPENAI_API_KEY is present (if only VITE_OPENAI_API_KEY exists)
    if (!content.includes('OPENAI_API_KEY') && content.includes('VITE_OPENAI_API_KEY')) {
        const val = content.match(/VITE_OPENAI_API_KEY=(.*)/)[1];
        newContent += `\nOPENAI_API_KEY=${val}`;
    }

    fs.writeFileSync(localEnvPath, newContent);
    console.log("✅ Created .env.local with NEXT_PUBLIC_ keys.");
} else {
    console.error("❌ .env file not found.");
}
