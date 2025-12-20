
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forceDelete() {
    console.log("🗑️ Force Deleting Recipe ID 1600 (Cleaning Foreign Keys first)...");

    // 1. Delete from registry_recipes first
    const { error: regError } = await client
        .from('registry_recipes')
        .delete()
        .eq('legacy_recipe_id', 1600);

    if (regError) {
        // Warning only, as it might fail if table doesn't have that column or something
        console.log("Warning (registry_recipes):", regError.message);
    } else {
        console.log("Deleted from registry_recipes.");
    }

    // 2. Delete from content_translations just in case there are orphans stored by scalar ID
    const { error: transError } = await client
        .from('content_translations')
        .delete()
        .eq('recipe_id', 1600); // Only if recipe_id is stored as scalar/text that matches '1600'

    // 3. Delete from recipes
    const { error } = await client
        .from('recipes')
        .delete()
        .eq('id', 1600);

    if (error) {
        console.error("Error deleting from recipes:", error);
    } else {
        console.log("✅ Successfully deleted Recipe ID 1600.");
    }
}

forceDelete();
