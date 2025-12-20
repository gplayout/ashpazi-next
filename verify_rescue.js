
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRescue() {
    const ids = [1567, 1571]; // Salad Shirazi, Mirza Ghasemi
    console.log("🔍 Checking Rescue IDs: ", ids);

    for (const id of ids) {
        const { data: recipe } = await supabase
            .from('recipes')
            .select(`
                id,
                name,
                content_translations(title, language_code)
            `)
            .eq('id', id)
            .single();

        if (recipe) {
            console.log(`\n✅ Recipe Found: [${recipe.id}] ${recipe.name}`);
            if (recipe.content_translations && recipe.content_translations.length > 0) {
                recipe.content_translations.forEach(t => {
                    console.log(`   - Trans (${t.language_code}): ${t.title}`);
                });
                console.log(`   🔗 Link: http://localhost:3000/recipe/${recipe.id}?lang=en`);
            } else {
                console.log(`   ⚠️ No translations found yet (Still processing?).`);
            }
        } else {
            console.log(`❌ ID ${id} not found in DB.`);
        }
    }
}

checkRescue();
