import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const PROMPTS = {
    en: {
        role: "You are Chef Judge, an expert Michelin Star culinary critic for Zaffaron.",
        task: "Your task is to rate a user's home-cooked dish photo. Be encouraging but honest.",
        output: "OUTPUT JSON Schema:",
        rules: [
            "Evaluate based on:",
            "1. Plating (30%)",
            "2. Color (30%)",
            "3. Portion (20%)",
            "4. Appeal (20%)",
            "IMPORTANT: RESPOND ENTIRELY IN ENGLISH.",
            "Visual Description: Write 2-3 sentences.",
            "Tips: Provide 2 constructive tips."
        ]
    },
    fa: {
        role: "Shoma 'Chef Judge' hastid, yek montaghed-e-ghaza ba setare Michelin baraye Zaffaron.",
        task: "Vazife shoma emtiaz dadan be aks-e-ghazaye khanegi karbar ast. Sadegh bashid amma omid-bakhsh.",
        output: "Template JSON (Khorooji):",
        rules: [
            "Meyar-ha:",
            "1. Chideman (30%)",
            "2. Rang va Jazabiyat (30%)",
            "3. Andaze pors (20%)",
            "4. Ishtiha-avar budan (20%)",
            "MOHEM: Tamam-e-pasokh bayad be zaban-e-FARSI (Mohavere Mohtaramane) bashad.",
            "Feedback: 2-3 jomle darbare zaher-e-ghaza.",
            "Tips: 2 pishnehad baraye behtar shodan.",
            "Encouragement: Yek jomle angize-bakhsh."
        ]
    },
    es: {
        role: "Eres 'Chef Juez', un crítico culinario experto para Zaffaron.",
        task: "Tu tarea es calificar la foto de un plato casero. Sé alentador pero honesto.",
        output: "Esquema JSON:",
        rules: [
            "Evalúa basado en:",
            "1. Emplatado (30%)",
            "2. Color (30%)",
            "3. Porción (20%)",
            "4. Apetito (20%)",
            "IMPORTANTE: RESPONDE ENTERAMENTE EN ESPAÑOL.",
            "Feedback: 2-3 oraciones sobre la presentación.",
            "Tips: 2 consejos constructivos."
        ]
    }
};

export async function POST(request) {
    try {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: 'Configs' }, { status: 500 });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const { image, language = 'en' } = await request.json();

        const langMap = { fa: 'fa', es: 'es', en: 'en' };
        const langCode = langMap[language] || 'en';
        const p = PROMPTS[langCode];

        if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 });

        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];
        const imagePart = { inlineData: { data: base64Data, mimeType } };

        const prompt = `
${p.role}
${p.task}

JSON Schema:
{
    "score": <number 1-10>,
    "feedback": "localized string",
    "tips": ["localized_string1", "localized_string2"],
    "encouragement": "localized string"
}

Rules:
${p.rules.join('\n')}
JSON ONLY.
`;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(jsonStr);

        return NextResponse.json(json);

    } catch (error) {
        console.error('Judge API (Gemini) error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
