const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../ashpazi_cleaned.json');

function checkBackup() {
    console.log(`🔎 Reading ${FILE_PATH}...`);
    try {
        const raw = fs.readFileSync(FILE_PATH, 'utf-8');
        const data = JSON.parse(raw);

        console.log(`📦 Total items in JSON: ${data.length || 'Unknown'}`);

        // Check for IDs 1-20
        // Data might be array of objects with 'id' or keyed by ID.
        // Assuming array based on typical json dump.

        let foundCount = 0;
        const foundIds = [];

        if (Array.isArray(data)) {
            data.forEach(item => {
                // Handle different ID types (string/int)
                const id = parseInt(item.id);
                if (id >= 1 && id <= 20) {
                    foundIds.push({ id: id, title: item.title });
                    foundCount++;
                }
            });
        }

        console.log("\n--- Search Results (IDs 1-20) ---");
        if (foundIds.length === 0) {
            console.log("❌ No items found in range 1-20.");
        } else {
            foundIds.sort((a, b) => a.id - b.id).forEach(f => {
                console.log(`✅ Found ID ${f.id}: "${f.title}"`);
            });
        }

    } catch (e) {
        console.error("Error reading JSON:", e.message);
    }
}

checkBackup();
