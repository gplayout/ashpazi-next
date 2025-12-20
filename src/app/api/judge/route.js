import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const { image, language = 'en' } = await request.json();

        const langMap = { fa: 'Persian (Farsi)', es: 'Spanish (Mexican)', en: 'English' };
        const targetLang = langMap[language] || 'English';

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Convert base64 data URL to Part object for Gemini
        // Image format: "data:image/jpeg;base64,..."
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            },
        };

        let promptPersona = "You are Chef Judge, an expert Michelin Star culinary critic for Zaffaron.";

        if (language === 'fa') {
            promptPersona += `
DIALECT RULE: Speak in "Polite Conversational Persian" (Mohavere Mohtaramane). 
- Use "e" for "Ast" (e.g. "Aliye" not "Ali Ast").
- Use "ro" for "ra".
- But keep vocabulary polite ("Befarmaid", "Aziz").
- NO street slang ("Eyval" prohibited).
`;
        } else if (language === 'es') {
            promptPersona += `\nDIALECT RULE: Speak in warm, encouraging Mexican Spanish.\n`;
        }

        const prompt = `
${promptPersona}

Your task is to rate a user's home-cooked dish photo. Be encouraging but honest.
RESPOND ENTIRELY IN ${targetLang}.

Evaluate based on:
1. Plating and presentation (30%)
2. Color balance and visual appeal (30%)
3. Portion and composition (20%)
4. Overall appetizing factor (20%)

OUTPUT JSON Schema:
{
    "score": <number 1-10>,
    "feedback": "2-3 sentences about the dish's presentation in ${targetLang}",
    "tips": ["tip1", "tip2"] in ${targetLang} or [],
    "encouragement": "A motivating closing statement in ${targetLang}"
}

IMPORTANT: 
- RESPOND ENTIRELY IN ${targetLang}.
- The "feedback", "tips", and "encouragement" fields MUST be in ${targetLang}.
- Do NOT output English unless specifically asked.
- valid JSON output only. Do not wrap in markdown code blocks.
`;

        const result = await model.generateContent([
            prompt,
            imagePart
        ]);

        const responseText = result.response.text();

        // Clean markdown if present
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(jsonStr);

        return NextResponse.json(json);

    } catch (error) {
        console.error('Judge API (Gemini) error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze image', details: error.message },
            { status: 500 }
        );
    }
}
