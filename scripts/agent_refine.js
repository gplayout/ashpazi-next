
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
You are a world-class culinary AI with expertise in global cuisine, food science, nutrition, cultural gastronomy, recipe development, and visual dish verification.
Your job is to rewrite, improve, standardize, translate, classify, and visually validate every recipe I provide.

PRIMARY OBJECTIVES:
1) Rewrite the recipe into a clean, accurate, professional, and high-quality form.  
2) Correct incomplete, incorrect, culturally unclear, or low-quality recipes.  
3) Extract and standardize nutritional and timing data.  
4) Identify the **national origin** of the dish and provide **cross-cultural equivalents** if they exist.  
5) Extract **food categories** (Keto, Vegan, Vegetarian, Gluten-free, traditional, etc.).  
6) Produce the final result in three fluent languages (Persian, English, Spanish).  
7) Validate the dish image AFTER rewriting the recipe.  
8) Adapt pork ingredients into optional alternatives and rewrite instructions accordingly.

ORIGIN & CULTURE RULES:
- Determine the most likely country of origin.
- If multiple countries share similar dishes, explain this briefly.
- Preserve authenticity while acknowledging global variations.

FOOD CATEGORY CLASSIFICATION:
Extract categories: Keto, Vegan, Vegetarian, Gluten-free, Dairy-free, High-protein, Low-fat, Halal-friendly, Traditional, Street Food, Dessert, Soup, Stew.

PORK SUBSTITUTION RULE:
If pork appears:
- Rewrite it as OPTIONAL.
- Offer culturally neutral alternatives (Beef, Lamb, Chicken, Turkey).
- Adjust instructions.

NUTRITION RULES:
- Extract calories, protein, carbs, fat (Per Serving).
- Correct unrealistic values.

TIMING RULES:
- Extract prep_time, cook_time, total_time.

IMAGE VALIDATION RULES:
- Analyze the provided food image.
- Evaluate consistency with the rewritten recipe.
- If matching → state clearly.
- If NOT matching → explain mismatch.

OUTPUT FORMAT:
Return a valid JSON object matching this structure exactly:
{
  "fa": {
    "name": "...",
    "origin": "...",
    "variants": "...",
    "categories": ["..."],
    "description": "...",
    "ingredients": ["..."],
    "instructions": ["..."],
    "chef_notes": "...",
    "pork_notes": "...",
    "nutrition": { "calories": 0, "protein": "0g", "carbs": "0g", "fat": "0g" },
    "times": { "prep": 0, "cook": 0, "total": 0 },
    "difficulty": "Medium"
  },
  "en": { ... same structure ... },
  "es": { ... same structure ... },
  "image_validation": {
    "is_match": true,
    "explanation": "...",
    "corrections": "..."
  }
}
`;

async function main() {
    console.log("👨‍🍳 Starting Culinary Agent Refinement (Native Fetch)...");

    // 1. Fetch Recipes
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name_en, ingredients_en, instructions_en, image')
        .order('id', { ascending: false })
        .limit(50);

    if (error) {
        console.error("DB Error:", error.message);
        return;
    }

    console.log(`📋 Found ${recipes.length} recipes to refine.`);

    const BATCH_SIZE = 5;
    for (let i = 0; i < recipes.length; i += BATCH_SIZE) {
        const batch = recipes.slice(i, i + BATCH_SIZE);
        console.log(`\n🚀 Processing Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(recipes.length / BATCH_SIZE)} (${batch.length} recipes)...`);

        await Promise.all(batch.map(async (recipe) => {
            console.log(`   🍳 Refining: ${recipe.name_en} (ID: ${recipe.id})...`);
            try {
                const userContent = [
                    { type: "text", text: `Refine this recipe:\nName: ${recipe.name_en}\nCurrent Ingredients: ${JSON.stringify(recipe.ingredients_en)}\nCurrent Instructions: ${JSON.stringify(recipe.instructions_en)}` },
                ];

                /*
                if (recipe.image) {
                    userContent.push({
                        type: "image_url",
                        image_url: {
                            "url": recipe.image
                        }
                    });
                }
                */

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "user", content: userContent }
                    ],
                    response_format: { type: "json_object" }
                });

                let parsed;
                if (!completion.choices[0].message.content) {
                    // Retry logic (simplified for parallel)
                    console.error(`   ⚠️ Refusal for ${recipe.id}. Retrying text-only...`);
                    const retryCompletion = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                            { role: "system", content: SYSTEM_PROMPT },
                            { role: "user", content: userContent } // already text-only technically
                        ],
                        response_format: { type: "json_object" }
                    });
                    if (!retryCompletion.choices[0].message.content) throw new Error("Retry failed");
                    parsed = JSON.parse(retryCompletion.choices[0].message.content);
                    parsed.image_validation = { is_match: true, explanation: "Validation skipped", corrections: "N/A" };
                } else {
                    let content = completion.choices[0].message.content;
                    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
                    parsed = JSON.parse(content);
                }

                if (!parsed.fa) throw new Error("Invalid structure");

                await saveRefinedData(recipe.id, parsed, recipe.image);
                console.log(`   ✅ Saved: ${recipe.name_en}`);
            } catch (e) {
                console.error(`   ❌ Error ${recipe.id}: ${e.message}`);
            }
        }));
    }
}

async function saveRefinedData(id, data, existingImage) {
    const updatePayload = {
        name: data.fa.name,
        name_en: data.en.name,
        ingredients: data.fa.ingredients,
        instructions: data.fa.instructions,
        ingredients_en: data.en.ingredients,
        instructions_en: data.en.instructions,
        // description: data.fa.description,
        prep_time_minutes: data.fa.times.prep,
        // cook_time_minutes: data.fa.times.cook, // Column missing in DB
        difficulty: data.fa.difficulty,
        calories: data.fa.nutrition.calories,
        nutrition_info: {
            fa: {
                ...data.fa.nutrition,
                macros: data.fa.nutrition,
                chef_insight: data.fa.chef_notes,
                times: data.fa.times,
                origin: data.fa.origin,
                variants: data.fa.variants,
                pork_notes: data.fa.pork_notes,
                categories: data.fa.categories
            },
            en: {
                ...data.en.nutrition,
                macros: data.en.nutrition,
                chef_insight: data.en.chef_notes,
                times: data.en.times,
                origin: data.en.origin,
                variants: data.en.variants,
                pork_notes: data.en.pork_notes,
                categories: data.en.categories
            },
            es: {
                ...data.es.nutrition,
                macros: data.es.nutrition,
                chef_insight: data.es.chef_notes,
                times: data.es.times,
                origin: data.es.origin,
                variants: data.es.variants,
                pork_notes: data.es.pork_notes,
                categories: data.es.categories
            },
            validation: data.image_validation
        },
        category: data.en.categories[0] || 'Main Course'
    };

    const { error: mainError } = await supabase
        .from('recipes')
        .update(updatePayload)
        .eq('id', id);

    if (mainError) throw new Error(`Main Update Error: ${mainError.message}`);

    // await supabase.from('recipe_translations').delete().eq('recipe_id', id);

    const translations = [
        { recipe_id: id, language: 'fa', title: data.fa.name, description: data.fa.description, ingredients: data.fa.ingredients, instructions: data.fa.instructions },
        { recipe_id: id, language: 'en', title: data.en.name, description: data.en.description, ingredients: data.en.ingredients, instructions: data.en.instructions },
        { recipe_id: id, language: 'es', title: data.es.name, description: data.es.description, ingredients: data.es.ingredients, instructions: data.es.instructions }
    ];

    const { error: transError } = await supabase
        .from('recipe_translations')
        .upsert(translations, { onConflict: 'recipe_id, language' });

    if (transError) throw new Error(`Translations Update Error: ${transError.message}`);
}

main();
