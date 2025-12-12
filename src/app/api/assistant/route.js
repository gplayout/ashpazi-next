import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Helper to convert Base64 to Buffer
const base64ToBuffer = (base64) => Buffer.from(base64, 'base64');

export async function POST(request) {
    try {
        const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

        if (!openaiKey) {
            return NextResponse.json({ error: 'Missing OpenAI API Key' }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey: openaiKey });

        // Parse Body
        const { audio, message, language = 'en', recipeContext } = await request.json();

        let userText = "";

        // Case A: Audio Input (Standard)
        if (audio) {
            // --- Step 1: Speech to Text (Whisper) ---
            const audioBuffer = base64ToBuffer(audio);
            const audioFile = await OpenAI.toFile(audioBuffer, 'audio.webm', { type: 'audio/webm' });

            const transcription = await openai.audio.transcriptions.create({
                file: audioFile,
                model: "whisper-1",
                language: language === 'fa' ? 'fa' : (language === 'es' ? 'es' : 'en'),
            });
            userText = transcription.text;
        }
        // Case B: Text Input (Debug / Typing)
        else if (message) {
            userText = message;
        }
        else {
            return NextResponse.json({ error: 'No audio or message provided' }, { status: 400 });
        }

        console.log(`User (${language}): ${userText}`);

        // --- Step 2: Intelligence (OpenAI GPT-4o-mini) ---
        // Migrated from Gemini to avoid 20/day quota limits

        let promptStyle = "";
        let voicePreset = "alloy";

        if (language === 'fa') {
            promptStyle = `
Language: Persian (Farsi).
DIALECT: POLITE CONVERSATIONAL (Mohavere Mohtaramane).
Style: Professional but friendly Chef. Not "Street", Not "Bookish".

CRITICAL ACCENT RULES:
1. GRAMMAR MUST BE SPOKEN (Mohavere):
   - "Ast" (است) -> "e" (ه). (e.g. "Khoob e").
   - "Miravid" (می‌روید) -> "Mirid" (می‌رید).
   - "Dahid" (دهید) -> "Bedid" (بدید).
   - "Ra" (را) -> "ro" (رو).
   
2. VOCABULARY MUST BE POLITE (Rasmi/Mohtaramane):
   - Do NOT use street slang like "Baba", "Damet garm", "Eyval".
   - Use polite terms: "Lotfan", "Befarmaid", "Aziz".
   - Avoid purely written words like "Zira" (use "Chon"), "Laza" (use "Baraye hamin").

3. ENGLISH WORDS:
   - Avoid if possible. Use "Makhloot" instead of "Mix".
   - If no common Farsi equivalent, use English (e.g. "Pasta").
`;
            voicePreset = "onyx";
        } else if (language === 'es') {
            promptStyle = `Language: Mexican Spanish. Warm and friendly.`;
            voicePreset = "echo";
        } else {
            promptStyle = `Language: English.`;
        }

        let systemPrompt = `You are Chef Zaffaron, an enthusiastic and warm Michelin Star Chef.
${promptStyle}

CRITICAL RULES:
1. Short answers (max 2 sentences).
2. Always include a quick "Pro Tip".
3. Be energetic.`;

        let userMessage = userText;
        if (recipeContext) {
            systemPrompt += `\n\nRecipe Context:\nTitle: ${recipeContext.title}\nIngredients: ${JSON.stringify(recipeContext.ingredients)}\nInstructions: ${JSON.stringify(recipeContext.instructions)}`;
        }

        // Generate Content using OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            max_tokens: 150,
        });

        const replyText = completion.choices[0].message.content;
        console.log(`Chef (OpenAI): ${replyText}`);

        // --- Step 3: Text to Speech (TTS - OpenAI) ---
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: voicePreset,
            input: replyText,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        const audioBase64 = buffer.toString('base64');

        return NextResponse.json({
            text: replyText,
            audio: audioBase64
        });

    } catch (error) {
        console.error('Assistant API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process voice request', details: error.message },
            { status: 500 }
        );
    }
}
