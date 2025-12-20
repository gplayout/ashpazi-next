import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Mock supabase client to avoid issues if needed, but we try real first
// Actually we need to import data.js. 
// data.js imports ./supabase which creates client.
// We need to ensure env vars are loaded BEFORE data.js is imported.

async function runTest() {
    console.log("🧪 TESTING getRecipeBySlug for 'ghormeh-sabzi'...");

    try {
        const { getRecipeBySlug } = await import('./src/lib/data.js');
        const result = await getRecipeBySlug('ghormeh-sabzi');

        if (!result) {
            console.error("❌ Result is NULL");
            return;
        }

        console.log("\n📦 RESULT RECEIVED:");
        console.log("Name:", result.name);
        console.log("Is Translation?", result._is_translation);
        console.log("Rich Content (Origin):", result.origin_history ? "✅ Present" : "❌ Missing");

        if (result._is_translation && result.origin_history) {
            console.log("\n✅ PASS: Tier 0 Aliases are now loading Golden Content!");
            console.log("Verify Output: " + result.origin_history.substring(0, 50) + "...");
        } else {
            console.error("\n❌ FAIL: Still loading legacy content.");
        }

    } catch (e) {
        console.error("💥 Execution Error:", e);
    }
}

runTest();
