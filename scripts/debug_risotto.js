
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecipe() {
    console.log("🔍 Checking a new Global Recipe (e.g. Risotto)...");

    const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', 1087)
        .limit(1)
        .single();

    if (error) {
        console.log("Error:", error);
        return;
    }

    console.log("ID:", data.id);
    console.log("Name:", data.name_en);
    console.log("Calories Column:", data.calories);
    console.log("Nutrition Info JSON:", JSON.stringify(data.nutrition_info, null, 2));
}

checkRecipe();
