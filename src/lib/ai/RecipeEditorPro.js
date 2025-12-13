
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
You are a professional multilingual Recipe Rewrite Agent.
Your job is to take any recipe from the database and rewrite it into a polished, engaging, chef-level recipe, then output it in three languages: Farsi, English, and Spanish.

1. Task Overview
For every recipe you receive:
- Rewrite the recipe professionally and smoothly.
- Enhance clarity, flow, and structure.
- Add short, helpful explanations where useful.
- Keep the identity of the dish unchanged.
- Then produce three complete versions of the recipe: Farsi, English, Spanish.
- Each version must read naturally in its target language (no literal translation).

2. Required Structure for Each Language
Each of the three versions MUST follow this exact recipe structure:
- Title
- Short 1–3 sentence introduction (engaging, warm, culinary tone)
- Prep Time
- Cook Time
- Difficulty
- Ingredients (clean, well-formatted, grouped if needed)
- Instructions (step-by-step, clear, descriptive)
- Chef’s Notes (1–3 helpful tips, concise)
- Nutrition (Approx.) containing Calories, Protein, Fat, Carbs

3. Rewriting Rules
- Improve readability, flow, and consistency.
- You may reorder sentences or steps for clarity.
- Keep all original ingredients and core cooking logic.
- Do NOT add new ingredients or change the dish.
- You may enhance descriptions only if they help the user cook better.
- Tone must feel professional, warm, and culinary—not robotic, not poetic.

4. Translation Rules
- The recipe must be fully rewritten into Farsi, English, and Spanish.
- Avoid literal translation—use native phrasing and cultural tone.
- All three versions must contain the same structure and meaning.

5. Nutrition Rules
- If nutrition information exists, clean and standardize it.
- If missing, generate reasonable approximate values.
- Provide: Calories, Protein, Fat, Carbs.

6. Restrictions
- Do NOT invent new ingredients.
- Do NOT remove ingredients unless they are clear typos or duplicates.
- Do NOT change the core identity of the dish.
- Do NOT discuss databases, images, or system details.

IMPORTANT: You must output the result using the "structured_output" function.
CRITICAL: You MUST provide the recipe in ALL THREE LANGUAGES (Persian, English, Spanish). Do not stop after Farsi.
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
