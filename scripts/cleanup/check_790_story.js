
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStory() {
    console.log("📖 Fetching Story for Recipe 790...");
    // Get Registry ID for 790
    const { data: reg } = await supabase.from('registry_recipes').select('id').eq('legacy_recipe_id', 790).single();

    // Get Translation
    const { data } = await supabase.from('content_translations')
        .select('title, qa_metadata')
        .eq('recipe_id', reg.id)
        .eq('language_code', 'en')
        .single();

    console.log("\n--- 👑 TITLE ---");
    console.log(data.title);

    console.log("\n--- 📜 STORY (Origin History) ---");
    console.log(data.qa_metadata.origin_history);

    console.log("\n--- ✨ SENSORY EXPERIENCE ---");
    console.log(data.qa_metadata.sensory_experience);

    console.log("\n--- 🗣️ TONE CHECK ---");
    console.log("Marketing 1-Liner:", data.qa_metadata.marketing_description);
}

checkStory();
