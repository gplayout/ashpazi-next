const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

// Config
const BATCH_SIZE = 10;
const DELAY_MS = 1000;

// Init
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: "You are an SEO Expert & Copywriter for 'Zaffaron', a premium global food platform. Your goal is to rewrite meta descriptions to be High-Converting & SEO-Optimized."
});

async function runSeoBlast() {
    console.log('🚀 Starting SEO Blast Daemon (Watch Mode)...');
    console.log('   Watching for "Chef Zaffaron" Remastered Recipes to optimize...');

    while (true) {
        // Fetch candidates: English
        // We fetch a larger batch size to ensure we catch everything eventually
        const { data: recipes, error } = await supabase
            .from('content_translations')
            .select('id, title, qa_metadata')
            .eq('language_code', 'en')
            .limit(20);

        if (error) {
            console.error('DB Error:', error.message);
            await new Promise(res => setTimeout(res, 5000));
            continue;
        }

        let workDone = false;

        for (const r of recipes) {
            // Check status
            const isOptimized = r.qa_metadata?.seo_optimized === true;
            const isRemastered = r.qa_metadata?.internal_score?.marketing_joy_score > 0;

            if (isOptimized) continue;

            // SAFETY CHECK: Wait for Chef Zaffaron
            if (!isRemastered) {
                // If we hit this, it means we found un-remastered stuff. 
                // In a real daemon we might skip, but here we just wait/continue scanning
                // console.log(`   ⏳ Waiting for Remaster: ${r.title.substring(0, 15)}...`);
                continue;
            }

            // Found actionable item
            await optimizeRecipe(r, r.qa_metadata?.marketing_description || "");
            workDone = true;
            await new Promise(res => setTimeout(res, DELAY_MS));
        }

        if (!workDone) {
            process.stdout.write('.'); // Heartbeat
            await new Promise(res => setTimeout(res, 5000));
        } else {
            console.log('\n   💤 Batch done, pausing...');
            await new Promise(res => setTimeout(res, 2000));
        }
    }
}

async function optimizeRecipe(recipe, currentDesc) {
    console.log(`\nparams: optimizing ${recipe.title}...`);

    const PROMPT = `
    Rewrite this recipe description to be an **SEO Powerhouse**.
    
    **Current:** "${currentDesc}"
    
    **Requirements:**
    1. Keep the "Marketing Joy" / Appetizing vibe.
    2. **INJECT KEYWORDS:** "Chef Supported", "Verified Recipe".
    3. **Tone:** Premium, Trustworthy, Click-Worthy.
    4. **Length:** Under 160 characters (strict SEO limit).
    5. **Output:** JUST the text.
    `;

    try {
        const result = await model.generateContent(PROMPT);
        const newDesc = result.response.text().trim();

        console.log(`   OLD: ${currentDesc.substring(0, 40)}...`);
        console.log(`   NEW: ${newDesc}`);

        // Update DB - Only update qa_metadata
        const newMeta = {
            ...recipe.qa_metadata,
            marketing_description: newDesc, // Update the description itself
            seo_optimized: true,
            marketing_joy_score: recipe.qa_metadata?.internal_score?.marketing_joy_score || 90,
            last_seo_update: new Date().toISOString()
        };

        const { error } = await supabase
            .from('content_translations')
            .update({
                qa_metadata: newMeta
            })
            .eq('id', recipe.id);

        if (error) console.error('   ❌ Save Failed:', error.message);
        else console.log('   ✅ Saved.');

    } catch (e) {
        console.error('   ❌ GenAI Error:', e.message);
    }
}

runSeoBlast();
