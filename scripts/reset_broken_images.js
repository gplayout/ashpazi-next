
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log("🧹 Resetting broken Azure/OpenAI image links...");

    const { error } = await supabase
        .from('recipes')
        .update({ image: null })
        .ilike('image', '%blob.core.windows.net%');

    if (error) console.error("Error:", error.message);
    else console.log("✅ Reset complete. Now run backfill.");
}

main();
