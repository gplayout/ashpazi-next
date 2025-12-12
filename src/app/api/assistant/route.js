import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Core System Prompt for the Charismatic Chef
const SYSTEM_PROMPT = `
You are "Chef Zaffaron", a world-renowned culinary expert, food historian, and charismatic host.
Your goal is to make the user fall in love with cooking and food culture.

**Your Personality:**
1.  **Warm & Witty:** You are friendly, slightly humorous, and very inviting.
2.  **Highly Knowledgeable:** You know the science, history, and art of food.
3.  **Engaging:** Never give dry answers. Use anecdotes, sensory details, and "Chef's Secrets".
4.  **Proactive:** Always end with a relevant question or a "did you know?" to keep the conversation flowing.

**CRITICAL RULE: LANGUAGE MATCHING (STRICT)**
- **Farsi Script:** If user writes in Farsi script (سلام), reply in **Farsi Script**.
- **Finglish (Farsi in Latin):** If user writes in Finglish (e.g., "Salam chetori?"), YOU MUST REPLY IN **FARSI SCRIPT**. Do NOT reply in Finglish or English.
   - Example Input: "Abgosht chetori bepazam?"
   - Example Reply: "آبگوشت یکی از خوشمزه‌ترین غذاهای اصیل ایرانیه! برای پختنش..."
- **English:** If user writes in standard English, reply in English.
- Do NOT translate unless asked. Just naturally converse in their language (or correct script).

**Context awareness:**
- Users might be asking about a specific recipe they are viewing. Use the provided 'recipeContext' to give specific advice.
`;

export async function POST(req) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'Missing OpenAI API Key' }, { status: 500 });
        }

        // Parse Request: Expect standard chat format
        const { message, messages, recipeContext } = await req.json();

        // Construct Message History for Context
        const conversationMessages = [
            { role: "system", content: SYSTEM_PROMPT },
        ];

        // Add Recipe Context if available (Hidden system note)
        if (recipeContext) {
            conversationMessages.push({
                role: "system",
                content: `User is currently viewing this recipe: ${JSON.stringify(recipeContext)}. Use this info to answer specific questions.`
            });
        }

        // Append previous chat history (if any)
        if (messages && Array.isArray(messages)) {
            // Limit history to last 6 messages to save tokens
            const recentHistory = messages.slice(-6).map(m => ({
                role: m.role, // 'user' or 'assistant'
                content: m.content
            }));
            conversationMessages.push(...recentHistory);
        }

        // Append current user message
        conversationMessages.push({ role: "user", content: message });

        // Call OpenAI (GPT-4o-mini for speed/quality balance)
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: conversationMessages,
            temperature: 0.8, // Slightly higher for creativity/charisma
            max_tokens: 500,
        });

        const reply = completion.choices[0].message.content;

        // Return Text Only (No Audio/TTS)
        return NextResponse.json({
            text: reply
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
