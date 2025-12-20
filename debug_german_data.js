
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkGermanData() {
    const id = '1058'; // One of the pilot IDs
    console.log(`Checking data for Recipe ID: ${id}`);

    const { data, error } = await supabase
        .from('recipes')
        .select('nutrition_info')
        .eq('legacy_id', id) // Assuming legacy_id is 1058 based on previous context, or is it the actual ID? 
        // The audit report used 1058 as ID. Wait, the report links used `recipe/1058`. 
        // In our data, IDs are UUIDs, but we might have a route that handles legacy IDs or the report used legacy IDs.
        // Let's check if 1058 is legacy_id.
        .single();

    if (error) {
        // Try searching by ID if it's a UUID, but 1058 looks like legacy.
        console.log("Error finding by legacy_id:", error.message);

        // Let's try to find ANY recipe with german data
        const { data: randomData } = await supabase
            .from('recipes')
            .select('id, nutrition_info')
            .not('nutrition_info->de', 'is', null)
            .limit(1);

        if (randomData && randomData.length > 0) {
            console.log("Found a recipe with German data:", randomData[0].id);
            console.log("German Title:", randomData[0].nutrition_info.de.name);
        } else {
            console.log("NO RECIPES FOUND with 'de' key in nutrition_info!");
        }
    } else {
        if (data.nutrition_info && data.nutrition_info.de) {
            console.log("✅ German Data EXISTS for 1058.");
            console.log("Title:", data.nutrition_info.de.name);
        } else {
            console.log("❌ German Data MISSING for 1058.");
            console.log("Keys found:", Object.keys(data.nutrition_info || {}));
        }
    }
}

checkGermanData();
