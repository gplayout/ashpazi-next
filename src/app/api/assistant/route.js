import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const limiter = rateLimit({ interval: 60_000, maxRequests: 20 });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Core System Prompt for the Master Chef
const SYSTEM_PROMPT = `
You are "Chef Zaffaron", a World-Renowned Persian Chef and Culinary Host.
Your personality is a unique blend of **Old-World Persian Charm** and **Modern Witty Sophistication**.

**YOUR PERSONA:**
1.  **The Gentleman Chef:** You are extremely polite ("Ba Kelas"), respectful, and hospitable. You treat every user like a VIP guest in your home.
2.  **Witty & Playful:** You have a good sense of humor. You make small, classy jokes (e.g., "A life without saffron is like a sky without stars!").
3.  **The Saffron Ambassador:** You OBSESS over Persian Saffron. You politely suggest adding it to dishes where it fits, calling it "The Red Gold".
4.  **Cultural Diplomat:** You are DEEPLY culturally sensitive. Never mock a culture. Always respect the user's food traditions while respectfully sharing your own.

**STRICT LANGUAGE RULES:**
1.  **DETECT & MATCH:** You must reply *strictly* in the language the user is currently speaking.
    - User speaks Farsi/Finglish -> Reply in **Farsi Script**.
    - User speaks French -> Reply in **French**.
    - User speaks English -> Reply in **English**.
2.  **No Switching:** Do not mix languages unless teaching a specific culinary term (e.g., "The *Tahdig* is essential").

**CONTEXT:**
You are the AI Assistant for the Zaffaron App.
`;

export async function POST(req) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const { allowed, remaining } = limiter.check(ip);
    if (!allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait a moment.' },
            { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': '0' } }
        );
    }

    try {
        const { message, messages, recipeContext, language = 'en' } = await req.json();

        // 1. Build History for Gemini
        // Gemini Expectation: History must be User -> Model -> User -> Model...
        // It CANNOT start with Model.
        const history = [];

        if (messages && Array.isArray(messages)) {
            // Filter valid turns
            const validTurns = messages
                .filter(m => m.role === 'user' || m.role === 'assistant' || m.role === 'model') // Ignore system
                .map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content || '' }]
                }));

            // Find the index of the first USER message
            const firstUserIndex = validTurns.findIndex(m => m.role === 'user');

            if (firstUserIndex !== -1) {
                // Slice from first User message to satisfy API
                const alignedHistory = validTurns.slice(firstUserIndex);
                history.push(...alignedHistory);
            } else {
                // If no user message in history (e.g. just greeting), send empty history.
                // The current 'message' will be the first user turn.
            }
        }

        // Add Recipe Context to the last user message or as a separate turn?
        // Better to embed it in the system prompt for this session or prepend to the prompt.
        let finalSystemPrompt = SYSTEM_PROMPT;
        finalSystemPrompt += `\n\nUSER UI LANGUAGE: ${language}`;
        if (recipeContext) {
            finalSystemPrompt += `\n\nCURRENT USER CONTEXT (Viewing Recipe): ${JSON.stringify(recipeContext)}\nFocus your advice on this dish if asked.`;
        }

        // Initialize Model WITH systemInstruction (Security Fix)
        // Using systemInstruction prevents prompt injection by separating context from conversation
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: finalSystemPrompt
        });

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 8192,
                temperature: 0.8,
            },
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return NextResponse.json({
            text: responseText
        });

    } catch (error) {
        console.error('Chat API Error (Gemini):', error);
        // Fallback for safety
        return NextResponse.json({
            text: `My apologies, the kitchen is a bit busy right now! (System Error: ${error.message})`
        }, { status: 500 });
    }
}
