import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

if (!openaiApiKey) { console.error("❌ API usage requires key."); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

const BUCKET_NAME = 'recipe-images';

async function generateSingle() {
    console.log("🕵️ Searching for 'kookoo sabzi'...");

    // Find the recipe
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .ilike('name', '%كوكوی سبزی%') // Persian search
        .limit(1);

    // Fallback English or slightly different Persian spelling if needed
    // But try this first. 
    // Actually, "kookoo sabzi" in Persian is "کوکوی سبزی" or "کوکو سبزی".

    let recipe = recipes?.[0];
    if (!recipe) {
        console.log("...Not found by 'كوكوی سبزی', trying English 'corn' logic just to find correct ID or 'kookoo' generic.");
        // Trying English 'kookoo'
        const { data: eng } = await supabase.from('recipes').select('*').ilike('name', '%kookoo%').limit(1);
        if (eng && eng.length > 0) recipe = eng[0];
    }

    // Manual Override: If the user meant "Corn Kookoo" (ID 427 from previous log), let's target that.
    // Wait, the user said "kookoo sabzi" specifically now. 
    // The previous batch had "Corn Kookoo". 
    // Let's try to find "Kookoo Sabzi".

    if (!recipe) {
        console.log("Doing a broader search for 'سبزی'...");
        const { data: anySabzi } = await supabase.from('recipes').select('*').ilike('name', '%سبزی%').limit(5);
        // Filter for Kookoo
        recipe = anySabzi?.find(r => r.name.includes('کوکو'));
    }

    if (!recipe) {
        console.error("❌ Could not find 'Kookoo Sabzi'. Please check spelling.");
        return;
    }

    console.log(`👨‍🍳 Found: ${recipe.name} (ID: ${recipe.id})`);

    // Refined Prompt (Home Cooked / Khonegi / Grandmother's Table)
    // Strategy: Casual, Warm, Imperfect, Authentic.
    const prompt = `A casual, authentic photo taken with an iPhone of a plate of homemade Persian Kookoo Sabzi on a traditional Sofreh (tablecloth). The dish looks hot and fresh, ready to eat. Generous portion. Natural indoor lighting (not a studio). No professional styling. Real Persian home cooking style. High quality but natural aesthetics.`;

    console.log(`   🎨 Generating (Style: Authentic/Bright)...`);
    const aiResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
    });

    const imageBase64 = aiResponse.data[0].b64_json;
    const buffer = Buffer.from(imageBase64, 'base64');
    const fileName = `ai-gen/${recipe.id}-refined-${Date.now()}.png`;

    console.log(`   cloud Uploading to Supabase...`);
    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, buffer, { contentType: 'image/png', upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    console.log(`   🔗 URL: ${publicUrl}`);

    await supabase.from('recipes').update({ image: publicUrl }).eq('id', recipe.id);
    console.log(`   ✅ Updated Recipe!`);
}

generateSingle();
