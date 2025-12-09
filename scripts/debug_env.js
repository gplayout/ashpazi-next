const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env.local');
console.log("Loading env from:", envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Dotenv Error:", result.error);
} else {
    console.log("Dotenv parsed:", Object.keys(result.parsed));
}

console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "EXISTS (Length: " + process.env.OPENAI_API_KEY.length + ")" : "MISSING");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "EXISTS" : "MISSING");
