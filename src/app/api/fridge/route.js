import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const limiter = rateLimit({ interval: 60_000, maxRequests: 10 });

// --- Localized Prompts ---
const PROMPTS = {
    en: {
        role: "You are an expert Chef and Ingredient Detector for Zaffaron.",
        task: "Analyze the image.",
        output: "OUTPUT JSON Schema:",
        rules: [
            "1. 'detected_dish': If you see a finished meal, name it (English). If raw ingredients, null.",
            "2. 'ingredients': List visible items in English.",
            "3. 'search_terms': MAX 5 English terms.",
            "4. 'notes': Write in English.",
            "5. JSON ONLY."
        ]
    },
    fa: {
        role: "Shoam yek Chef herfei va Shenasagar-e-Mavad baraye Zaffaron hastid.",
        task: "Tasvir ra tahlil konid.",
        output: "Template JSON (Khorooji):",
        rules: [
            "1. 'detected_dish': Agar ghaza kamel ast, name English an ra benevisid. Agar faghat mavad ast, null.",
            "2. 'ingredients': Mavad-e-dide-shode ra be FARSI benevisid.",
            "3. 'search_terms': 5 kalamat-e-kelidi English baraye search.",
            "4. 'notes': Yek tozih kootah va mohtaramane be FARSI benevisid.",
            "5. 'ingredients': Bayad hatman FARSI bashad.",
            "6. Faqat JSON valid bedahid."
        ]
    },
    es: {
        role: "Eres un Chef experto y detector de ingredientes para Zaffaron.",
        task: "Analiza la imagen.",
        output: "Esquema JSON de Salida:",
        rules: [
            "1. 'detected_dish': Nombre del plato en Inglés (o null).",
            "2. 'ingredients': Lista de ingredientes en Español.",
            "3. 'search_terms': Palabras clave en Inglés.",
            "4. 'notes': Escribe en Español.",
            "5. SOLO JSON."
        ]
    },
    de: {
        role: "Sie sind ein erfahrener Koch und Zutatendetektor für Zaffaron.",
        task: "Analysieren Sie das Bild.",
        output: "Ausgabe JSON Schema:",
        rules: [
            "1. 'detected_dish': Name des Gerichts auf Englisch (oder null).",
            "2. 'ingredients': Liste der Zutaten auf Deutsch.",
            "3. 'search_terms': Suchbegriffe auf Englisch.",
            "4. 'notes': Schreiben Sie auf Deutsch.",
            "5. NUR JSON."
        ]
    },
    fr: {
        role: "Vous êtes un Chef expert et détecteur d'ingrédients pour Zaffaron.",
        task: "Analysez l'image.",
        output: "Schéma JSON de sortie :",
        rules: [
            "1. 'detected_dish': Nom du plat en Anglais (ou null).",
            "2. 'ingredients': Liste des ingrédients en Français.",
            "3. 'search_terms': Mots-clés en Anglais.",
            "4. 'notes': Écrivez en Français.",
            "5. SEULEMENT JSON."
        ]
    },
    ar: {
        role: "أنت طاهٍ خبير وكاشف للمكونات في زعفران.",
        task: "حلل الصورة.",
        output: "مخطط JSON للمخرجات:",
        rules: [
            "1. 'detected_dish': اسم الطبق بالإنجليزية (أو null).",
            "2. 'ingredients': قائمة المكونات بالعربية.",
            "3. 'search_terms': كلمات البحث بالإنجليزية.",
            "4. 'notes': اكتب بالعربية.",
            "5. JSON فقط."
        ]
    },
    zh: {
        role: "你是 Zaffaron 的专家大厨和食材检测员。",
        task: "分析图片。",
        output: "输出 JSON 模式：",
        rules: [
            "1. 'detected_dish': 英文菜名（或 null）。",
            "2. 'ingredients': 中文食材列表。",
            "3. 'search_terms': 英文搜索词。",
            "4. 'notes': 用中文写。",
            "5. 仅限 JSON。"
        ]
    },
    ja: {
        role: "あなたはZaffaronの専門シェフ兼食材検出器です。",
        task: "画像を分析してください。",
        output: "出力JSONスキーマ：",
        rules: [
            "1. 'detected_dish': 料理名を英語で（またはnull）。",
            "2. 'ingredients': 食材リストは日本語で。",
            "3. 'search_terms': 検索語は英語で。",
            "4. 'notes': 日本語で書いてください。",
            "5. JSONのみ。"
        ]
    },
    hi: {
        role: "आप Zaffaron के लिए एक विशेषज्ञ रसोइया और सामग्री डिटेक्टर हैं।",
        task: "छवि का विश्लेषण करें।",
        output: "आउटपुट JSON स्कीमा:",
        rules: [
            "1. 'detected_dish': यदि अंग्रेजी नाम पता है तो लिखें (या null)।",
            "2. 'ingredients': सामग्री की सूची हिंदी में।",
            "3. 'search_terms': खोज के लिए अंग्रेजी शब्द।",
            "4. 'notes': हिंदी में लिखें।",
            "5. केवल JSON।"
        ]
    },
    ko: {
        role: "당신은 Zaffaron의 전문 셰프이자 재료 탐지기입니다.",
        task: "이미지를 분석하세요.",
        output: "출력 JSON 스키마:",
        rules: [
            "1. 'detected_dish': 요리 이름은 영어로 (또는 null).",
            "2. 'ingredients': 재료 목록은 한국어로.",
            "3. 'search_terms': 검색어는 영어로.",
            "4. 'notes': 한국어로 작성하세요.",
            "5. JSON만 출력."
        ]
    }
};

export async function POST(request) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const { allowed, remaining } = limiter.check(ip);
    if (!allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait a moment.' },
            { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': '0' } }
        );
    }

    try {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: 'Configs missing' }, { status: 500 });

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const { image, language = 'en' } = await request.json();

        // Language Setup
        const langMap = { fa: 'fa', es: 'es', en: 'en', de: 'de', fr: 'fr', ar: 'ar', zh: 'zh', ja: 'ja', hi: 'hi', ko: 'ko' };
        // Normalize: 'fa-IR' -> 'fa', default to 'en'
        const normalizedLang = (language || 'en').substring(0, 2).toLowerCase();
        const langCode = langMap[normalizedLang] || 'en';
        const p = PROMPTS[langCode];

        if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 });

        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];
        const imagePart = { inlineData: { data: base64Data, mimeType } };

        // 1. Vision API - Localized Prompt
        const systemPrompt = `
${p.role}
${p.task}

JSON Schema:
{
    "detected_dish": "English Name or null",
    "ingredients": ["localized_item1", "localized_item2"],
    "search_terms": ["english_term1", "english_term2"],
    "notes": "Localized notes"
}

Rules:
${p.rules.join('\n')}
`;

        const result = await model.generateContent([systemPrompt, imagePart]);
        const responseText = result.response.text();
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const detected = JSON.parse(jsonStr);

        const ingredients = detected.ingredients || [];
        const rawTerms = detected.search_terms || [];
        const processedTerms = new Set();
        rawTerms.forEach(t => {
            processedTerms.add(t.toLowerCase());
            // Split "elbow macaroni"
            const words = t.split(' ');
            if (words.length > 1) words.forEach(w => { if (w.length > 3) processedTerms.add(w.toLowerCase()); });
        });
        const searchTerms = Array.from(processedTerms);

        if (!ingredients.length && !detected.detected_dish) {
            return NextResponse.json({ ingredients: [], recipes: [], message: "No match" });
        }

        // 2. FIND RELEVANT RECIPE IDs (Using Search Terms)
        let candidateIds = new Set();

        // A: Dish Name Search (English - High Precision)
        if (detected.detected_dish) {
            const { data } = await supabase
                .from('recipe_translations')
                .select('recipe_id')
                .eq('language', 'en')
                .ilike('title', `%${detected.detected_dish}%`)
                .limit(4);
            if (data) data.forEach(r => candidateIds.add(r.recipe_id));
        }

        // B: English Search Terms (Medium Precision)
        if (candidateIds.size < 4) {
            for (const term of searchTerms.slice(0, 4)) {
                const { data } = await supabase
                    .from('recipe_translations')
                    .select('recipe_id')
                    .eq('language', 'en')
                    .or(`title.ilike.%${term}%, ingredients.ilike.%${term}%`)
                    .limit(2);
                if (data) data.forEach(r => candidateIds.add(r.recipe_id));
            }
        }

        // C: FALLBACK - Native Ingredient Search (Low Precision but High Recall for Localized Inputs)
        // If English search failed OR yielded few results, search the LOCALIZED terms in the TARGET language table.
        // e.g. Search "Makkaroni" in "de" translations.
        // NOTE: We only do this if we have a target language where native search makes sense.
        // For Hindi/Korean, if we don't have translated recipes yet, this might return 0 results, which is fine.
        if (candidateIds.size < 2 && ingredients.length > 0) {
            // Take top 3 detection ingredients
            for (const term of ingredients.slice(0, 3)) {
                if (term.length < 3) continue;
                const { data } = await supabase
                    .from('recipe_translations')
                    .select('recipe_id')
                    .eq('language', langCode) // Target Language!
                    .ilike('ingredients', `%${term}%`) // Search ingredients column
                    .limit(2);
                if (data) data.forEach(r => candidateIds.add(r.recipe_id));
            }
        }

        const uniqueIds = Array.from(candidateIds).slice(0, 6);

        // 3. FETCH FULL RECIPE DATA (With ALL Translations)
        let finalRecipes = [];
        if (uniqueIds.length > 0) {
            const { data } = await supabase
                .from('recipes')
                .select(`
                    *,
                    recipe_translations(*)
                `)
                .in('id', uniqueIds);

            if (data) finalRecipes = data;
        }

        return NextResponse.json({
            ingredients,
            recipes: finalRecipes,
            notes: detected.notes
        });

    } catch (error) {
        console.error('Fridge API error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
