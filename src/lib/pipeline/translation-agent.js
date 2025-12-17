
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extracts all integers from a string.
 * @param {string} text 
 * @returns {number[]} Sorte list of integers found
 */
function extractNumbers(text) {
    if (!text) return [];
    // Matches English digits (0-9) and Persian digits (۰-۹) are normalized elsewhere? 
    // Wait, contract says source instruction has numbers. 
    // We assume source is Persian. We should match Persian digits too if present, 
    // but typically IngestionAgent normalized ingredients. Instructions might still have Persian digits.
    // Let's rely on standard digits if possible, or mapping.
    // For safety, let's match both \d and Persian range if needed, but usually 
    // standard regex \d works for English digits. 
    // If output is English, we expect English digits.
    // Source might have "۲". 
    // Let's stick to simple \d+ for now, assuming output EN has digits.
    // If we need to validate Source(FA) vs Output(EN), we need to map FA->EN digits for comparison.

    // Helper to normalize FA digits to EN
    const faToEn = s => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
    const normalized = faToEn(text);
    const matches = normalized.match(/\d+/g);
    return matches ? matches.map(Number).sort((a, b) => a - b) : [];
}

export class TranslationAgent {

    /**
     * Translates a recipe to English (Title + Instructions).
     * @param {object} input 
     * @param {string} input.recipe_id
     * @param {string} input.source_title
     * @param {string[]} input.source_instructions
     * @param {string[]} input.ingredients_context (Do not translate, just for context)
     * @returns {Promise<object>} { title_en, instructions_en: [{step, text, metadata}] }
     */
    static async translate(input) {
        if (!input.source_instructions || !Array.isArray(input.source_instructions)) {
            throw new Error("Invalid input: source_instructions must be an array");
        }

        const prompt = `
You are a professional Culinary Translator. Translate the following Persian recipe to English.

CONTEXT (Ingredients - DO NOT OUTPUT):
${input.ingredients_context.join('\n')}

SOURCE TITLE: ${input.source_title}

SOURCE INSTRUCTIONS:
${input.source_instructions.map((line, i) => `${i + 1}. ${line}`).join('\n')}

RULES:
1. OUTPUT JSON ONLY.
2. Structure: { "title_en": "...", "instructions_en": [ { "step": 1, "text": "...", "metadata": {} }, ... ] }
3. DO NOT include ingredients in the output.
4. PRESERVE ALL NUMBERS (time, temp, quantity). Default to original units (e.g. Celsius) unless obvious.
5. "text" should be clear, imperative English culinary commands.
6. "metadata" can contain "derived_duration_min" (integer) if a duration is explicit in the step, otherwise empty object.
`;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Or gpt-3.5-turbo if 4o-mini implies 4o logic
                messages: [
                    { role: "system", content: "You are a helpful culinary translator. Output valid JSON only." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1, // Low temp for deterministic output
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error("Empty response from AI");

            let result;
            try {
                result = JSON.parse(content);
            } catch (e) {
                throw new Error("AI response was not valid JSON");
            }

            // --- VALIDATION LAYER ---

            // 1. Structure Check
            if (!result.title_en || !Array.isArray(result.instructions_en)) {
                throw new Error("Invalid structure: missing title_en or instructions_en array");
            }

            // 2. Numeric Integrity Check (Loose)
            // Goal: Ensure numbers in Source appear in Output (mapped).
            // This is tricky because "2 onions" might be in context, but instruction says "fry onion".
            // Implementation: We won't block strictly on *all* numbers, but we will warn/error on *missing critical* numbers if possible.
            // 2. Numeric Integrity Check (STRICT)
            // Goal: Ensure numbers in Source appear in Output.
            const sourceText = input.source_instructions.join(' ');
            const outText = result.instructions_en.map(s => s.text).join(' ');

            const sourceNums = extractNumbers(sourceText);
            const outNums = extractNumbers(outText);

            // Check existence in sets (ignoring frequency for now, or match exact counts? 
            // Simple robust check: Every source number must exist in output.

            const outNumsCopy = [...outNums];
            const missingNums = [];

            for (const num of sourceNums) {
                const idx = outNumsCopy.indexOf(num);
                if (idx !== -1) {
                    outNumsCopy.splice(idx, 1); // consume match
                } else {
                    missingNums.push(num);
                }
            }

            if (missingNums.length > 0) {
                throw new Error(`Numeric Integrity Violation: Missing numbers [${missingNums.join(', ')}] in translation.`);
            }

            // Length check
            if (result.instructions_en.length < input.source_instructions.length / 2) {
                throw new Error("Suspiciously low number of steps compared to source.");
            }

            return result;

        } catch (err) {
            console.error("Translation ERROR:", err);
            throw err; // Re-throw to be handled by worker
        }
    }
}
