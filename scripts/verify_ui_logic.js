
import { ui, getUiLabel } from '../src/utils/dictionaries.js';

console.log("Testing UI Logic...");

const keys = ['latest_recipes', 'hero_title', 'minutes'];
const languages = ['fa', 'en', 'es', 'fr']; // Testing an undefined language too

languages.forEach(lang => {
    console.log(`\n--- Language: ${lang} ---`);
    keys.forEach(key => {
        const result = getUiLabel(key, lang);
        console.log(`${key}: "${result}"`);
    });
});

console.log("\nSpecific Check for Spanish Hero Title:");
console.log(`hero_title (es): "${getUiLabel('hero_title', 'es')}"`);
if (getUiLabel('hero_title', 'es') === 'Zaffaron') {
    console.log("✅ Spanish Title matches (Zaffaron is same in all, bad example? Let's check subtitle)");
}

const subKey = 'hero_subtitle';
const subEs = getUiLabel(subKey, 'es');
console.log(`hero_subtitle (es): "${subEs}"`);

if (subEs === 'La cocina persa de clase mundial') {
    console.log("✅ Spanish Subtitle Verified.");
} else {
    console.error("❌ Spanish Subtitle MISMATCH.");
}
