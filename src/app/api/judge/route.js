import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }

        const { image, language = 'en' } = await request.json();

        const langMap = { fa: 'Persian (Farsi)', es: 'Spanish (Mexican)', en: 'English' };
        const targetLang = langMap[language] || 'English';

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Init OpenAI
        const openai = new OpenAI({ apiKey });

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

        const systemPrompt = `
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

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Judge my dish!" },
                        { type: "image_url", image_url: { url: image } }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 300
        });

        const json = JSON.parse(completion.choices[0].message.content);
        return NextResponse.json(json);

    } catch (error) {
        console.error('Judge API error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze image', details: error.message },
            { status: 500 }
        );
    }
}
