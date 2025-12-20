
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
// Dynamic import to ensure process.env is populated first
const { TranslationAgent } = await import('./src/lib/pipeline/translation-agent.js');

// Initialize Supabase Service Role Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mock Input for 1541 (Egg Fried Rice)
const mockInput = {
    recipe_id: "1541",
    source_title: "برنج سرخ‌شده کلاسیک با تخم‌مرغ",
    source_instructions: [
        "۲ پیمانه برنج یاسمین پخته (ترجیحاً یک‌روزه)",
        "۲ عدد تخم‌مرغ درشت",
        "۱ پیمانه سبزیجات مخلوط (هویج، نخودفرنگی، ذرت)",
        "۳ عدد پیازچه، خردشده",
        "۳ قاشق غذاخوری سس سویا",
        "۲ قاشق غذاخوری روغن مایع",
        "۱ قاشق چای‌خوری روغن کنجد",
        "نمک و فلفل سیاه به میزان لازم",
        "روغن را در تابه ووک یا تابه بزرگ روی حرارت متوسط گرم کنید تا داغ شود.",
        "تخم‌مرغ‌ها را کمی بزنید و در تابه بریزید. سریع هم بزنید تا تکه‌های نرم و نیم‌پز ایجاد شوند. از تابه خارج کنید.",
        "باقی‌مانده روغن مایع را به همان تابه اضافه کنید. سبزیجات مخلوط را اضافه کرده و ۲ تا ۳ دقیقه تفت دهید تا گرم و کمی نرم شوند.",
        "برنج پخته را اضافه کنید و با کفگیر گلوله‌ها را باز کنید. حدود ۵ دقیقه تفت دهید تا برنج کاملاً گرم شده و کمی برشته شود.",
        "تخم‌مرغ‌ها را به تابه برگردانید. سس سویا، روغن کنجد، نمک و فلفل را اضافه کنید.",
        "همه مواد را خوب با هم مخلوط کنید و ۲ دقیقه دیگر تفت دهید تا کاملاً یکدست و معطر شوند، سپس بلافاصله سرو کنید."
    ],
    ingredients_context: [
        "Rice", "Eggs", "Mixed Veg (Carrot, Peas, Corn)", "Green Onion", "Soy Sauce", "Oil", "Sesame Oil"
    ],
    targetLanguage: "en"
};

async function runTest() {
    console.log("Starting Generation for 1541...");
    try {
        const result = await TranslationAgent.translate(mockInput);
        console.log("GENERATION SUCCESS!");
        console.log("Title:", result.title);

        // Prepare QA Metadata with rich content (Full Super-Schema)
        const qa_metadata = {
            ...result.internal_score,
            marketing_description: result.marketing_description,
            origin_history: result.origin_history,
            why_this_version: result.why_this_version,
            sensory_experience: result.sensory_experience,
            chef_guide: result.chef_guide,
            nutrition: result.nutrition,

            // New "Ruthless" Data Fields
            dietary_tags: result.dietary_tags,
            occasion_tags: result.occasion_tags,
            seasonality: result.seasonality,
            difficulty_level: result.difficulty_level,
            ingredient_substitutions: result.ingredient_substitutions,
            equipment_needed: result.equipment_needed,
            flavor_profile: result.flavor_profile,
            pairings: result.pairings,
            estimated_cost: result.estimated_cost,
            seo_keywords: result.seo_keywords,
            seo_meta_description: result.seo_meta_description,
            social_share_copy: result.social_share_copy,
            allergen_contains: result.allergen_contains,
            kid_friendly: result.kid_friendly
        };

        // Get UUID from Registry
        const { data: reg } = await supabase.from('registry_recipes').select('id').eq('legacy_recipe_id', 1541).single();
        if (!reg) throw new Error("Registry ID not found for 1541");

        // Update DB
        console.log("Updating DB for UUID:", reg.id);
        const { error } = await supabase
            .from('content_translations')
            .update({
                title: result.title,
                ingredients: result.ingredients,
                instructions: result.instructions,
                qa_metadata: qa_metadata,
                publish_status: 'published'
            })
            .eq('recipe_id', reg.id)
            .eq('language_code', 'en');

        if (error) throw error;
        console.log("DB UPDATE SUCCESSFUL!");

    } catch (e) {
        console.error("GENERATION/UPDATE FAILED:", e);
    }
}

runTest();
