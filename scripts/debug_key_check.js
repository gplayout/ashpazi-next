const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const viteKey = process.env.VITE_OPENAI_API_KEY;
if (viteKey) {
    const last4 = viteKey.slice(-4);
    console.log(`VITE_OPENAI_API_KEY found. Ends with: ...${last4}`);
} else {
    console.log("VITE_OPENAI_API_KEY NOT found.");
}
