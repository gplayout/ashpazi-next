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
    },
    de: {
        role: "Sie sind 'Chef Judge', ein Experte und Michelin-Sterne-Kritiker für Zaffaron.",
        task: "Bewerten Sie das Foto des hausgemachten Gerichts. Seien Sie ermutigend, aber ehrlich.",
        output: "Ausgabe JSON Schema:",
        rules: [
            "Bewerten Sie basierend auf:",
            "1. Anrichten (30%)",
            "2. Farbe (30%)",
            "3. Portion (20%)",
            "4. Appetitlichkeit (20%)",
            "WICHTIG: ANTWORTEN SIE VOLLSTÄNDIG AUF DEUTSCH.",
            "Feedback: 2-3 Sätze über die Präsentation.",
            "Tips: 2 konstruktive Tipps."
        ]
    },
    fr: {
        role: "Vous êtes 'Chef Juge', un critique culinaire expert Michelin pour Zaffaron.",
        task: "Notez la photo du plat fait maison. Soyez encourageant mais honnête.",
        output: "Schéma JSON de sortie :",
        rules: [
            "Évaluez sur la base de :",
            "1. Dressage (30%)",
            "2. Couleur (30%)",
            "3. Portion (20%)",
            "4. Appétence (20%)",
            "IMPORTANT : RÉPONDEZ ENTIÈREMENT EN FRANÇAIS.",
            "Feedback : 2-3 phrases sur la présentation.",
            "Tips : 2 conseils constructifs."
        ]
    },
    ar: {
        role: "أنت 'الشيف الحكم'، ناقد طعام خبير حائز على نجمة ميشلان في زعفران.",
        task: "مهمتك هي تقييم صورة طبق مطبوخ في المنزل. كن مشجعاً ولكن صادقاً.",
        output: "مخطط JSON للمخرجات:",
        rules: [
            "التقييم بناءً على:",
            "1. التقديم (30%)",
            "2. اللون (30%)",
            "3. الكمية (20%)",
            "4. الشهية (20%)",
            "مهم: أجب بالكامل باللغة العربية.",
            "Feedback: 2-3 جمل حول العرض.",
            "Tips: نصيحتان بناءتان."
        ]
    },
    zh: {
        role: "你是 'Chef Judge'，Zaffaron 的一位米其林星级美食评论家。",
        task: "你的任务是评价用户自制的菜肴照片。既要鼓励，又要诚实。",
        output: "输出 JSON 模式：",
        rules: [
            "评估标准：",
            "1. 摆盘 (30%)",
            "2. 色彩 (30%)",
            "3. 分量 (20%)",
            "4. 食欲感 (20%)",
            "重要：完全用中文回答。",
            "Feedback: 关于外观的2-3句话。",
            "Tips: 2个建设性的建议。"
        ]
    },
    ja: {
        role: "あなたはZaffaronのミシュラン星付き料理評論家「シェフ・ジャッジ」です。",
        task: "ユーザーの手作り料理の写真を評価してください。励ましつつも正直に。",
        output: "出力JSONスキーマ：",
        rules: [
            "評価基準：",
            "1. 盛り付け (30%)",
            "2. 色彩 (30%)",
            "3. ポーション (20%)",
            "4. 食欲をそそるか (20%)",
            "重要：完全に日本語で回答してください。",
            "Feedback: プレゼンテーションについての2-3文。",
            "Tips: 2つの建設的なアドバイス。"
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

        // Language Setup
        const langMap = { fa: 'fa', es: 'es', en: 'en', de: 'de', fr: 'fr', ar: 'ar', zh: 'zh', ja: 'ja' };
        // Normalize: 'fa-IR' -> 'fa', default to 'en'
        const normalizedLang = (language || 'en').substring(0, 2).toLowerCase();
        const langCode = langMap[normalizedLang] || 'en';
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
