
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// --- Configuration ---
const RECIPE_ID = 1303; // Kookoo Sabzi
// ---------------------

// Initialize Clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
});

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase Credentials missing. Checked NEXT_PUBLIC_... and VITE_...");
    process.exit(1);
}

async function main() {
    console.log("👨‍🍳 Starting Chef Agent: Visual Understanding...");

    // 1. Fetch Recipe
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: recipe, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', RECIPE_ID)
        .single();

    if (error || !recipe) {
        console.error("❌ Recipe not found:", error);
        return;
    }

    console.log(`🍲 Recipe: ${recipe.name}`);
    console.log(`📝 Ingredients Preview: ${JSON.stringify(recipe.ingredients || []).substring(0, 100)}...`);

    // 2. Step 1: "The Chef" - Visual Analysis
    console.log("\n🧠 Agent 1: The Chef (Analyzing Visuals)...");

    const chefPrompt = `
    You are 'Ashpaz Bashi', an expert Persian Chef and Food Stylist.
    Your goal is to describe the PHYSICAL APPEARANCE of a dish so accurately that a blind photographer could take a perfect photo of it.
    
    Recipe Name: ${recipe.name}
    Ingredients: ${JSON.stringify(recipe.ingredients)}
    Instructions: ${JSON.stringify(recipe.instructions)}

    Analyze the recipe and output a DALL-E 3 Prompt.
    
    Rules for the Description:
    1. **Texture**: Is it crispy, soupy, fluffy, chunky? (e.g. "thick golden crust", "oily surface", "chunks of meat").
    2. **Color Palette**: Be specific (e.g. "deep emerald green", "saffron yellow", "charred brown").
    3. **Garnish**: What goes ON TOP? (e.g. "barberries", "pistachio slivers", "dollop of yogurt").
    4. **Plating**: How is it traditionally served? (e.g. "on a flatbread", "in a clay pot", "cut into wedges").
    5. **Style**: "Authentic, Home-Cooked, Persian Grandmother Style".
    6. **Lighting**: "Natural window light, harsh shadows, morning sun".
    7. **Camera**: "iPhone 15 Pro, Macro lens, top-down view".
    
    Output ONLY the raw prompt text for DALL-E. Do not include "Here is the prompt:".
  `;

    const chefResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "system", content: chefPrompt }],
        temperature: 0.7,
    });

    const visualSpec = chefResponse.choices[0].message.content.trim();
    console.log(`\n📋 Visual Spec Generated:\n"${visualSpec}"`);

    // 3. Step 2: "The Photographer" - Image Generation
    console.log("\n📸 Agent 2: The Photographer (Shooting)...");

    try {
        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: visualSpec,
            n: 1,
            size: "1024x1024",
            quality: "hd",
            style: "natural",
        });

        const imageUrl = imageResponse.data[0].url;
        console.log(`\n✅ Image Generated!`);
        console.log(`🔗 ${imageUrl}`);
        console.log("\n(Review the link above to see the result)");

    } catch (err) {
        console.error("❌ Image Generation Failed:", err.message);
    }
}

main().catch(console.error);
