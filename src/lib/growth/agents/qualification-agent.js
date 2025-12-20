
import { GoogleGenerativeAI } from '@google/generative-ai';

export class QualificationAgent {
    constructor() {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        this.model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); // Fast & Smart
    }

    /**
     * Analyzes a raw Instagram profile to determine if it's a valid Home Chef / Supplier.
     * @param {object} profile The raw profile object
     * @returns {Promise<object>} { score: number, is_qualified: boolean, reasoning: string, chef_type: string }
     */
    async qualify(profile) {
        const prompt = `
        You are the "Zaffaron Scout", an expert in identifying high-quality home chefs and independent food suppliers on Instagram.
        
        YOUR GOAL:
        Analyze the provided Instagram Profile data and determine if this is a legitimate "Home Chef" or "Small Food Business" that sells food directly to customers.
        
        You must Filter OUT:
        - "Food Bloggers" / "Tasters" (They review food, they don't sell it).
        - "Restaurants" (Large chains or established venues are low priority, we want independent chefs).
        - "Personal Accounts" (People just posting their lunch).
        - "Inactive Accounts".

        INPUT DATA:
        Handle: ${profile.handle}
        Bio: "${profile.bio}"
        Followers: ${profile.followers}
        Recent Captions: ${JSON.stringify(profile.last_posts.map(p => p.caption))}

        SCORING CRITERIA (0-100):
        - **Commercial Intent (40%)**: Does the bio say "Order", "DM", "Pickup", "Price", "Catering"?
        - **Content Relevance (30%)**: Do posts look like menus or product showcases?
        - **Independence (20%)**: Does it look like a home/indie operation (High Value) vs a corporate chain (Low Value)?
        - **Engagement (10%)**: Are they active?

        OUTPUT FORMAT (JSON ONLY):
        {
            "score": number, // 0-100
            "is_qualified": boolean, 
            "chef_type": "home_chef" | "small_business" | "blogger" | "personal" | "restaurant" | "unknown",
            "reasoning": "string", 
            "detected_location": "string", // e.g. "Tehran", "London", or null
            "detected_language": "string" // e.g. "en", "fa", "de", "fr", "es", "ar", "ja", "zh" (ISO Code),
            "country_code": "string" // e.g. "IR", "UK", "DE", "FR"
        }
        `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
            const response = result.response.text();
            return JSON.parse(response);
        } catch (error) {
            console.error("Qualification Agent Error:", error);
            return { score: 0, is_qualified: false, reasoning: "AI Error", chef_type: "unknown" };
        }
    }
}
