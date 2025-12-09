const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const key = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "";
console.log(`Loaded Key Length: ${key.length}`);
console.log(`Key Suffix: ...${key.slice(-5)}`);
if (key.length < 10) console.log("WARNING: Key seems too short or empty.");
