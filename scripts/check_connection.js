
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log("🔍 Diagnosing Network...");

    // 1. Check Supabase
    try {
        console.log("Testing Supabase...");
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        const { data, error } = await supabase.from('recipes').select('id').limit(1);
        if (error) throw error;
        console.log("✅ Supabase Connected!");
    } catch (e) {
        console.error("❌ Supabase Failed:", e.message);
    }

    // 2. Check OpenAI
    try {
        console.log("Testing OpenAI...");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        await openai.models.list();
        console.log("✅ OpenAI Connected!");
    } catch (e) {
        console.error("❌ OpenAI Failed:", e.message);
    }
}

main();
