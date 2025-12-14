
const OpenAI = require('openai');

class RecipeEditorPro {
    constructor(apiKey, model = "gpt-5.2-chat-latest") {
        this.openai = new OpenAI({ apiKey: apiKey });
        this.model = model;
        // Output Schema Definition
        this.outputSchema = {
            type: "object",
            properties: {
                persian: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        origin: { type: "string" },
                        variants: { type: "string" },
                        categories: { type: "array", items: { type: "string" } },
                        description: { type: "string" },
                        ingredients: { type: "array", items: { type: "string" } },
                        instructions: { type: "array", items: { type: "string" } },
                        chef_notes: { type: "string" },
                        pork_notes: { type: "string" },
                        nutrition: {
                            type: "object",
                            properties: { calories: { type: "number" }, protein: { type: "string" }, carbs: { type: "string" }, fat: { type: "string" } }
                        },
                        times: {
                            type: "object",
                            properties: { prep: { type: "number" }, cook: { type: "number" }, total: { type: "number" } }
                        },
                        difficulty: { type: "string" }
                    },
                    required: ["name", "ingredients", "instructions"]
                },
                english: { type: "object", description: "Same structure as persian, but in English" },
                spanish: { type: "object", description: "Same structure as persian, but in Spanish" }
            },
            required: ["persian", "english", "spanish"]
        };

        this.systemPrompt = `
You are a World-Class Michelin Star Chef and Expert Food Historian.
Your task is to rewrite recipes into "Premium, Deeply Educational, and Comparative" culinary narratives.

**CRITICAL INSTRUCTION: THE 3-PARAGRAPH RULE**
You MUST write a rich, long description (approx. 150-200 words) divided into 3 distinct sections:

1.  **ORIGIN & HISTORY**:
    - Start with the dish's true roots (e.g., "Lasagna originated in Naples...").
    - Explain how it traveled or evolved.

2.  **COMPARISON & DIFFERENTIATION (The "Why This Version?" Section)**:
    - You MUST explain how *this specific version* (e.g., Iranian Style) differs from the original (e.g., Italian meaning).
    - Highlighting specific ingredients or techniques that make it unique (e.g., "Unlike the Italian classic which uses parmesan, the Iranian version relies heavily on spiced beef and turmeric...").
    - If it is a standard dish, explain what makes this *specific recipe* the "Premium" version.

3.  **SENSORY EXPERIENCE & PRO TIPS**:
    - Describe the texture, aroma, and final mouthfeel.
    - End with a chef's serving suggestion.

**TONE**: Authoritative, Academic yet Warm, Sophisticated.

**STRUCTURE**:
- Produce 3 outputs: Farsi, English, Spanish.
- Farsi must use high-level, polite, and descriptive vocabulary (not colloquial).
- English must use magazine-quality food writing.

**JSON SCHEMA (Strict Match Required):**
{
  "name": "Refined Name (Specific & Descriptive)",
  "origin": "Short string like 'Italy/Iran'",
  "description": "The rich 3-paragraph narrative defined above.",
  "chef_notes": "Exactly 3 short bullet points: 1) Pro Tip 👨‍🍳, 2) Common Mistake ⚠️, 3) Storage/Serving 🥡.",
  "ingredients": ["List", "of", "Refined", "Ingredients"],
  "instructions": ["Step 1...", "Step 2..."],
  "macros": { "calories": 0, "protein": "0g", "carbs": "0g", "fat": "0g" },
  "health_benefits": ["Scientific Benefit 1", "Scientific Benefit 2"],
  "times": { "prep": 0, "cook": 0, "total": 0 },
  "categories": ["Main Course", "Persian"]
}

9. **HANDLING UNKNOWN / UNIQUE / LOCAL RECIPES**:
- If the dish is a "Chef's Creation" or "Local Family Recipe" with no famous history:
  - Do **NOT** invent a fake history.
  - Instead, focus on the **ingredients' history** (e.g. "While this specific dish is a modern creation, its use of Saffron traces back to ancient Persia...").
  - Frame it as a "Modern Fusion" or "Comfort Classic".

10. **MANDATORY FARSI GLOSSARY (Do Not Transliterate)**:
- Oregano → آویشن
- Basil → ریحان
- Rosemary → رزماری
- Thyme → آویشن شیرازی / کاکوتی
- Parsley → جعفری
- Cilantro/Coriander → گشنیز
- Cumin → زیره
- Turmeric → زردچوبه
- Pasta → پاستا
- Spaghetti → اسپاگتی
- Sauce → سس
- Cheese → پنیر
`;
    }

    async process(recipeText, imageUrl = null) {
        if (!recipeText) return { status: "error", message: "Missing recipe_text" };

        console.log(`🤖 RecipeEditorPro: Starting Parallel Generation for 3 Languages (${this.model})...`);
        const startTime = Date.now();

        try {
            // Run all 3 languages in parallel for speed and to avoid token timeouts
            const [persian, english, spanish] = await Promise.all([
                this._generateLanguage(recipeText, 'persian'),
                this._generateLanguage(recipeText, 'english'),
                this._generateLanguage(recipeText, 'spanish')
            ]);

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Parallel Generation Complete in ${duration}s`);

            return {
                status: "success",
                output: {
                    persian,
                    english,
                    spanish,
                    image_validation: { is_match: true, explanation: "Skipped by user request" }
                }
            };

        } catch (error) {
            console.error("RecipeEditorPro Error:", error.message);
            return {
                status: "error",
                message: error.message
            };
        }
    }

    async _generateLanguage(recipeText, language) {
        const langConfig = {
            persian: "Farsi (Persian)",
            english: "English",
            spanish: "Spanish"
        };

        const langName = langConfig[language];

        // Specific schema for one language
        const singleSchema = {
            type: "object",
            properties: {
                name: { type: "string" },
                origin: { type: "string" },
                variants: { type: "string" },
                categories: { type: "array", items: { type: "string" } },
                description: { type: "string" },
                ingredients: { type: "array", items: { type: "string" } },
                instructions: { type: "array", items: { type: "string" } },
                chef_notes: { type: "string" },
                health_benefits: { type: "array", items: { type: "string" }, description: "2-3 short, scientific health benefits of the dish." },
                pork_notes: { type: "string" },
                nutrition: {
                    type: "object",
                    properties: { calories: { type: "number" }, protein: { type: "string" }, carbs: { type: "string" }, fat: { type: "string" } }
                },
                times: {
                    type: "object",
                    properties: { prep: { type: "number" }, cook: { type: "number" }, total: { type: "number" } }
                },
                difficulty: { type: "string" }
            },
            required: ["name", "ingredients", "instructions", "description", "nutrition", "health_benefits"]
        };

        const response = await this.openai.chat.completions.create({
            model: this.model,
            messages: [
                {
                    role: "system",
                    content: this.systemPrompt + `\n\nCRITICAL: You are generating ONLY the ${langName} version now. Output ONLY the single JSON object for ${langName}. Include 'health_benefits' array.`
                },
                {
                    role: "user",
                    content: `RAW RECIPE:\n${recipeText}\n\nTask: Rewrite this in ${langName} according to the rules.`
                }
            ],
            max_completion_tokens: 16000,
            functions: [{
                name: "save_recipe",
                description: `Save the ${langName} version of the recipe.`,
                parameters: singleSchema
            }],
            function_call: { name: "save_recipe" },
        });

        const functionCall = response.choices[0].message.function_call;
        if (!functionCall) throw new Error(`Model passed on ${language}`);

        try {
            const data = JSON.parse(functionCall.arguments);
            // Defaulting arrays if missing
            if (!data.categories) data.categories = [];
            if (!data.times) data.times = { prep: 0, cook: 0, total: 0 };
            return data;
        } catch (e) {
            console.error(`Failed to parse ${language} JSON`, functionCall.arguments);
            throw new Error(`Invalid JSON for ${language}`);
        }
    }
}

module.exports = RecipeEditorPro;
