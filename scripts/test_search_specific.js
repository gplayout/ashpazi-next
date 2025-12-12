// Native fetch (Node 18+)

async function testSpecificSearch() {
    const port = 3000;
    // 'Parsley' is in the English title "Parsley Stew..."
    // 'قورمه' is in the Farsi name
    const queries = ["Parsley", "قورمه"];

    console.log("🔍 Starting Real-World Search Test...\n");

    for (const q of queries) {
        const url = `http://localhost:${port}/api/search?q=${encodeURIComponent(q)}`;
        console.log(`👉 Searching for: "${q}"`);

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.recipes && data.recipes.length > 0) {
                console.log(`   ✅ Found ${data.recipes.length} matches.`);
                console.log(`   🍲 Top Result: ${data.recipes[0].name} (ID: ${data.recipes[0].id})`);
            } else {
                console.log(`   ❌ No results found.`);
            }
        } catch (e) {
            console.error(`   🔥 Error: ${e.message}`);
        }
        console.log("-".repeat(30));
    }
}

testSpecificSearch();
