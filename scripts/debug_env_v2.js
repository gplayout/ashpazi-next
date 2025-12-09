const path = require('path');
const dotenv = require('dotenv');

const files = ['.env.local', '.env'];
files.forEach(file => {
    const envPath = path.resolve(__dirname, '../', file);
    console.log(`\n--- Loading ${file} ---`);
    const result = dotenv.config({ path: envPath, override: true }); // override to see what's inside

    if (result.error) {
        console.log(`Error loading ${file}:`, result.error.message);
    } else {
        const keys = Object.keys(result.parsed);
        console.log(`Keys found:`, keys);
        if (keys.includes('OPENAI_API_KEY')) {
            console.log(`SUCCESS: Found OPENAI_API_KEY in ${file}!`);
            console.log(`Value length: ${result.parsed.OPENAI_API_KEY.length}`);
        } else {
            console.log(`OPENAI_API_KEY NOT found in ${file}.`);
        }
    }
});
