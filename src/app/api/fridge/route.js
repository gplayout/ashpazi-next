import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
    }
};

export async function POST(request) {
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
        const langMap = { fa: 'fa', es: 'es', en: 'en' }; // Simplify to code
        const langCode = langMap[language] || 'en';
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

        // Search Logic (Always searches in English/Translations)
        // 1. Process Terms
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

        // A: Dish Name Search
        if (detected.detected_dish) {
            const { data } = await supabase
                .from('recipe_translations') // Search directly in translations table for speed
                .select('recipe_id')
                .eq('language', 'en') // Search English titles
                .ilike('title', `%${detected.detected_dish}%`)
                .limit(4);
            if (data) data.forEach(r => candidateIds.add(r.recipe_id));
        }

        // B: Ingredient Search
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

        const uniqueIds = Array.from(candidateIds).slice(0, 6);

        // 3. FETCH FULL RECIPE DATA (With ALL Translations)
        // This solves the 'Link is English' bug. We fetch *all* translations so the frontend 
        // can find the one matching the user's language.
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
