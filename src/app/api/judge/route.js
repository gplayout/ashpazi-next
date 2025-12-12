import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const googleKey = process.env.GOOGLE_API_KEY;
        if (!googleKey) {
            return NextResponse.json({ error: 'Google API key not configured' }, { status: 500 });
        }

        const { image, language = 'en' } = await request.json();

        const langMap = { fa: 'Persian (Farsi)', es: 'Spanish (Mexican)', en: 'English' };
        const targetLang = langMap[language] || 'English';

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Convert Data URL to standard Base64 for Gemini
        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }
        const mimeType = matches[1];
        const base64Data = matches[2];

        // Init Gemini
        const genAI = new GoogleGenerativeAI(googleKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            generationConfig: { responseMimeType: "application/json" }
        });

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
            promptPersona += `
DIALECT RULE: Speak in warm, encouraging Mexican Spanish.
`;
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
`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: mimeType } }
        ]);

        const json = JSON.parse(result.response.text());
        return NextResponse.json(json);

    } catch (error) {
        console.error('Judge API error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze image', details: error.message },
            { status: 500 }
        );
    }
}
