const { searchImages } = require('duck-duck-scrape');

async function test() {
    console.log("Testing search with defaults...");
    try {
        const results = await searchImages("Persian Food");
        console.log(`Success! Found ${results.results.length} images.`);
    } catch (e) {
        console.error("FATAL: Search still failing:", e.message);
    }
}

test();
