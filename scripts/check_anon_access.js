
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Strictly use the PUBLIC/ANON env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAnon() {
    console.log("--- Testing Anonymous Access ---");
    // 1. Check User (Should be null)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("Current User:", user ? `Logged In (${user.email})` : "Guest (Anon)");

    if (user) {
        console.warn("WARNING: Script expects to be running as Guest. Signing out...");
        await supabase.auth.signOut();
    }

    // 2. Fetch Recipes (Mimic page.js)
    console.log("\nFetching recipes as Guest...");
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name_en, image')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Fetch Error:", error);
        return;
    }

    console.log(`Fetched ${recipes.length} recipes.`);

    // 3. Analyze Images
    const validImages = recipes.filter(r => r.image && r.image.length > 5);
    console.log(`Recipes with valid images: ${validImages.length} / ${recipes.length}`);

    if (validImages.length === 0) {
        console.log("FAILURE: Guests see 0 valid images. RLS/Permissions issue confirmed.");
    } else {
        console.log("SUCCESS: Guests can see images.");
        console.log("Sample Image:", validImages[0].image);
    }
}

checkAnon();
