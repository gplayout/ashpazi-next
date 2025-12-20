
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteRecipe1600() {
    console.log("🗑️ Deleting broken/duplicate Recipe ID 1600...");

    const { error } = await client
        .from('recipes')
        .delete()
        .eq('id', 1600);

    if (error) {
        console.error("Error deleting:", error);
    } else {
        console.log("✅ Successfully deleted Recipe ID 1600.");
    }
}

deleteRecipe1600();
