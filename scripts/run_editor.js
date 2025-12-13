
const RecipeEditorPro = require('../src/lib/ai/RecipeEditorPro');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        console.error("❌ No API Key found.");
        return;
    }

    const agent = new RecipeEditorPro(apiKey);

    // Placeholder for user input
    const recipeText = process.argv[2] || `
    Spaghetti Carbonara
    Pasta, eggs, bacon, cheese.
    Cook pasta. Fry bacon. Mix eggs and cheese. Combine.
    `;

    console.log("👨‍🍳 RecipeEditorPro: Processing...");
    if (process.argv[2]) console.log(`Input length: ${recipeText.length} chars`);

    // Image URL is deliberately null
    const result = await agent.process(recipeText, null);

    if (result.status === "success") {
        console.log("\n✅ Result:\n");
        console.log(JSON.stringify(result.output, null, 2));
    } else {
        console.error("\n❌ Error:", result.message);
    }
}

main();
