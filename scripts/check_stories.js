
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars. Please ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStories() {
    console.log("Fetching recipes...");
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(24); // Same limit as page.js

    if (error) {
        console.error("Error fetching recipes:", error);
        return;
    }

    console.log(`Fetched ${recipes.length} recipes.`);

    const validStories = recipes.filter(r => r.image && r.image.length > 5);

    console.log(`Valid Stories (image > 5 chars): ${validStories.length}`);

    if (validStories.length === 0) {
        console.log("No stories found! checking first 5 recipes images:");
        recipes.slice(0, 5).forEach(r => {
            console.log(`- ID: ${r.id}, Image: ${r.image ? r.image.substring(0, 20) + '...' : 'NULL'}`);
        });
    } else {
        console.log("Stories found IDs:", validStories.map(s => s.id));
    }
}

checkStories();
