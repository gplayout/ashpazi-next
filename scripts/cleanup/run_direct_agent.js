require('dotenv').config({ path: '.env.local' });
const { TranslationAgent } = require('./src/lib/pipeline/translation-agent');

// Mock Input
const mockInput = {
    recipe_id: "test-debug-123",
    source_title: "Ghormeh Sabzi",
    source_instructions: [
        "Soak beans overnight.",
        "Fry herbs until dark.",
        "Cook meat with onions.",
        "Simmer everything for 3 hours."
    ],
    ingredients_context: [
        "Meat: Lamb chunks",
        "Herbs: Parsley, Cilantro, Fenugreek",
        "Beans: Red Kidney beans",
        "Spice: Turmeric, Dried Lime"
    ],
    targetLanguage: "en"
};

async function runDebug() {
    console.log("🧪 Starting Direct Debug of TranslationAgent...");
    console.log("   Target Model: gemini-3-flash-preview (User Request)");

    try {
        const result = await TranslationAgent.translate(mockInput);
        console.log("\n✅ SUCCESS! Model worked.");
        console.log("   Title:", result.title);
        console.log("   Score:", result.internal_score);
    } catch (error) {
        console.error("\n❌ CRITICAL FATAL ERROR:");
        console.error("   Message:", error.message);
        console.error("   Full Error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
}

runDebug();
