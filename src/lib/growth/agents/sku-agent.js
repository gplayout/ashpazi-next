
import { GoogleGenerativeAI } from '@google/generative-ai';

export class SkuAgent {
    constructor() {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        this.model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    }

    /**
     * Extracts sellable products (SKUs) from a qualified chef's posts.
     * @param {object} profile The qualified profile
     * @param {string} language ISO code (e.g. 'en', 'fa', 'de') - Defaults to 'en'
     * @returns {Promise<object[]>} Array of SKU objects
     */
    async generateSkus(profile, language = 'en') {
        const postsText = profile.last_posts.map((p, i) => `Post ${i + 1}: "${p.caption}" (Image: ${p.image_url})`).join('\n');

        const prompt = `
        You are the "Zaffaron Menu Architect".
        Your task is to analyze the recent posts of a Home Chef ("${profile.handle}") and extract DISTINCT, SELLABLE DISHES to create a virtual menu.

        INPUT POSTS:
        ${postsText}

        TARGET LANGUAGE: "${language}" (You MUST write Title and Description in this language).

        INSTRUCTIONS:
        1. Identify specific dishes mentioned.
        2. Ignore generic posts.
        3. If a price is mentioned, capture it. If not, estimate a "market_price_range" in the local currency.
        4. "Zaffaron Touch": Write the description in a seductive, premium tone in the Target Language ("${language}").
           - Even if the chef is Italian and the language is Italian, keep the style "Warm & Elevating".

        OUTPUT FORMAT (JSON ARRAY):
        [
            {
                "title": "Dish Name (${language})",
                "original_caption_snippet": "Snippet...",
                "description": "2-sentence appetizing description in ${language}.",
                "price_detected": "string or null",
                "suggested_price_range": "string",
                "image_source": "mock_img_X.jpg",
                "dietary_tags": ["Halal", "Vegan", etc] (In English)
            }
        ]
        
        Limit to top 3 distinct items.
        `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
            const response = result.response.text();
            return JSON.parse(response);
        } catch (error) {
            console.error("SKU Agent Error:", error);
            return [];
        }
    }
}
