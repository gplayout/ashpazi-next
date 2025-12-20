
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
const { TranslationAgent } = await import('./src/lib/pipeline/translation-agent.js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runGoldenBatch() {
    console.log("🎲 Selecting 5 Random Recipes for Quality Audit...");

    // Get 5 random IDs
    const { data: recipes } = await supabase.from('recipes').select('id, name, ingredients, instructions').limit(50); // Fetch strict 50 then shuffle
    if (!recipes || recipes.length < 5) {
        console.error("Not enough recipes found.");
        return;
    }

    // Shuffle and pick 5
    const selected = recipes.sort(() => 0.5 - Math.random()).slice(0, 5);

    console.log("🧪 Testing The Following 5 Candidates:");
    selected.forEach(r => console.log(`   - [${r.id}] ${r.name}`));

    console.log("\n🚀 RUNNING PIPELINE...\n");

    for (const recipe of selected) {
        console.log(`\n---------------------------------------------`);
        console.log(`PROCESSING: ${recipe.name} (${recipe.id})`);

        try {
            const agentInput = {
                recipe_id: String(recipe.id),
                source_title: recipe.name,
                source_instructions: typeof recipe.instructions === 'string' ? JSON.parse(recipe.instructions) : recipe.instructions,
                ingredients_context: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients,
                targetLanguage: "en"
            };

            const result = await TranslationAgent.translate(agentInput);

            console.log(`✅ SUCCESS!`);
            console.log(`   TITLE:      "${result.title}"`);
            console.log(`   TAGS:       [${result.dietary_tags.join(', ')}]`);
            console.log(`   FLAVOR:     Savory: ${result.flavor_profile?.savory}/10 | Sweet: ${result.flavor_profile?.sweet}/10`);
            console.log(`   DIFFICULTY: ${result.difficulty_level}`);
            console.log(`   MASTERY:    "${result.chef_guide?.pro_tip?.substring(0, 50)}..."`);

            // Simple validation check
            if (!result.dietary_tags || result.dietary_tags.length === 0) console.warn("   ⚠️ WARNING: No tags generated!");

        } catch (e) {
            console.error(`❌ FAILED: ${e.message}`);
        }
    }
    console.log(`\n---------------------------------------------`);
    console.log("🏁 Batch Audit Complete.");
}

runGoldenBatch();
