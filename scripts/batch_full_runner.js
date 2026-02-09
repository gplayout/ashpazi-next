const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

// --- CONFIG ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !geminiKey) {
    console.error("Missing Env.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); // STABLE MODEL
const CONCURRENCY = 8; // SPEED BOOST

async function runFullBatch() {
    console.log(`🚀 Starting Full Batch Optimization (Self-Contained)...`);

    // 1. Fetch ALL IDs
    let allRecipes = [];
    let from = 0;
    const PAGE_SIZE = 1000;

    console.log("📥 Fetching ALL recipe IDs...");

    while (true) {
        const { data, error } = await supabase
            .from('recipes')
            .select('id')
            .order('id', { ascending: true })
            .range(from, from + PAGE_SIZE - 1);

        if (error || !data || data.length === 0) break;

        allRecipes = [...allRecipes, ...data];
        from += PAGE_SIZE;
        console.log(`   Fetched ${data.length} IDs...`);
        if (data.length < PAGE_SIZE) break;
    }

    const total = allRecipes.length;
    console.log(`📋 Found TOTAL ${total} recipes.`);

    // Helper to process a single ID
    const processRecipe = async (id, index) => {
        try {
            // A. Check if already upgraded (Registry Check)
            const { data: reg } = await supabase
                .from('registry_recipes')
                .select('id, content_translations(language_code, qa_metadata)')
                .eq('legacy_recipe_id', id)
                .maybeSingle();

            // Analyze if upgrade exists for English (Rich V2 with Swaps)
            let needsUpgrade = true;
            if (reg && reg.content_translations) {
                const en = reg.content_translations.find(t => t.language_code === 'en');
                // CHECK FOR NEW FIELDS: chef_swaps
                if (en && en.qa_metadata && en.qa_metadata.chef_swaps && en.qa_metadata.origin_history) {
                    needsUpgrade = false; // Already Rich V2
                }
            }

            if (!needsUpgrade) {
                // console.log(`⏭️ [${index}/${total}] Skipping ID ${id} (Already Rich V2)`);
                return;
            }

            // B. Fetch Source Data
            const { data: recipe } = await supabase
                .from('recipes')
                .select('name_en, ingredients_en, instructions_en')
                .eq('id', id)
                .single();

            if (!recipe) return;

            // C. Generate Rich Content
            const prompt = `
            Analyze this recipe: "${recipe.name_en}".
            Ingredients: ${JSON.stringify(recipe.ingredients_en)}
            Instructions: ${JSON.stringify(recipe.instructions_en)}

            Return JSON ONLY with this EXACT structure for an expert culinary platform:
            {
                "title": "${recipe.name_en}",
                "internal_score": {
                    "health_score": <1-100>,
                    "taste_score": <1-100>,
                    "difficulty_score": <1-100>,
                    "marketing_joy_score": <1-100>
                },
                "times": {
                    "prep": <minutes_int>,
                    "cook": <minutes_int>,
                    "total": <minutes_int>
                },
                "difficulty_level": "Medium|Hard|Expert", 
                "dietary_tags": ["string"],
                "origin_history": "A rich 2-sentence paragraph about the cultural history...",
                "flavor_profile": { "spicy": <1-10>, "umami": <1-10>, "salty": <1-10>, "sour": <1-10>, "sweet": <1-10>, "bitter": <1-10> },
                "sensory_experience": "A poetic description of the texture and aroma...",
                "chef_guide": { 
                    "pro_tip": "string",
                    "common_mistake": "string",
                    "storage": "string"
                },
                "chef_swaps": { "OriginalIngredient": "Substitute" },
                "pairing_suggestions": ["string"],
                "marketing_description": "A compelling 1-sentence hook."
            }
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const json = JSON.parse(text.replace(/```json|```/g, '').trim());

            // D. Save to DB (Registry + Translation) - ATOMIC UPSERT

            // 1. Ensure Registry
            let regId = reg?.id;
            if (!regId) {
                const { data: newReg } = await supabase
                    .from('registry_recipes')
                    .insert({ legacy_recipe_id: id, source_type: 'batch_v2' })
                    .select()
                    .single();
                regId = newReg.id;
            }

            // 2. Upsert English Translation
            const { error: upsertError } = await supabase
                .from('content_translations')
                .upsert({
                    recipe_id: regId, // FK
                    language_code: 'en',
                    title: json.title,
                    ingredients: recipe.ingredients_en, // Keep original
                    instructions: recipe.instructions_en, // Keep original
                    qa_metadata: json,
                    publish_status: 'published'
                    // updated_at: new Date().toISOString() // Removed due to schema error
                }, { onConflict: 'recipe_id, language_code' });

            if (upsertError) {
                console.error(`❌ [${index}/${total}] DB Error ID ${id}:`, upsertError.message);
            } else {
                console.log(`✅ [${index}/${total}] Upgraded ID ${id}: ${json.title}`);
            }

        } catch (err) {
            console.error(`🔥 [${index}/${total}] Crash ID ${id}:`, err.message);
        }
    };

    // 2. Process with Concurrency
    const queue = [...allRecipes];
    let activeWorkers = 0;
    let completed = 0;

    const next = async () => {
        if (queue.length === 0) return;
        activeWorkers++;
        const item = queue.shift();
        await processRecipe(item.id, completed + 1);
        completed++;
        activeWorkers--;
        if (queue.length > 0) await next();
    };

    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(next());
    }

    await Promise.all(workers);
    console.log(`\n🎉 Full Batch Process Complete!`);
}

runFullBatch();
