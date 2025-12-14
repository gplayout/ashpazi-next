
const RecipeEditorPro = require('../src/lib/ai/RecipeEditorPro');
require('dotenv').config({ path: '.env.local' });

async function testGlossary() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    const agent = new RecipeEditorPro(apiKey);

    const rawText = `
    Name: Chef Mehdi's Secret Pasta
    Ingredients: 2 cups Pasta, 1 tbsp Oregano, 1 tsp Thyme, Salt.
    Instructions: Mix oregano and thyme with pasta. Serve hot.
    `;

    console.log("🧪 Testing AI Glossary & Unique Recipe Logic...");
    const result = await agent.process(rawText);

    if (result.status === "success") {
        console.log("\n--- Persian Output ---");
        console.log("Name:", result.output.persian.name);
        console.log("Description (Look for 'Modern/Ingredient History'):\n", result.output.persian.description);
        console.log("Ingredients (Look for 'آویشن'):\n", result.output.persian.ingredients);
    } else {
        console.error("Failed:", result.message);
    }
}

testGlossary();
