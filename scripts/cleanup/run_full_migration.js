const fetch = require('node-fetch');

// Config
const SECRET = 'pipeline_secret_777'; // Safe dev fallback
const LANG = 'en';
const BATCH_SIZE = 5;
const START_OFFSET = 0;
const MAX_OFFSET = 5; // Cap at 5 for USER VERIFICATION (First 5 only)

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFullMigration() {
    console.log(`🚀 STARTING CHEF ZAFFARON MIGRATION (${LANG.toUpperCase()}) 🚀`);
    console.log(`Token Secret: ${SECRET.slice(0, 5)}...`);

    let offset = START_OFFSET;
    let errorsInRow = 0;
    let totalSuccess = 0;
    let totalSkipped = 0;

    while (offset < MAX_OFFSET) {
        console.log(`\n🔄 Processing Offset ${offset} - ${offset + BATCH_SIZE}...`);

        try {
            const url = `http://localhost:3000/api/pipeline/translate?secret=${SECRET}&lang=${LANG}&offset=${offset}`;
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();

            if (!data.ok) {
                console.error(`❌ Batch Failed: ${data.error}`);
                errorsInRow++;
            } else {
                const s = data.summary;
                console.log(`✅ Result: ${s.success} New | ${s.skipped} Skipped | ${s.failed} Failed`);
                if (s.success > 0) {
                    s.details.forEach(d => {
                        if (d.title) console.log(`   - 🍳 ${d.title}`);
                        if (d.error) console.log(`   - ⚠️ Error: ${d.error}`);
                    });
                }

                totalSuccess += s.success;
                totalSkipped += s.skipped;
                errorsInRow = 0;
            }

            // Stop condition: Empty result (End of DB)
            if (data.message === 'No normalized recipes found') {
                console.log('🎉 End of Database Reached! Migration Complete.');
                break;
            }

        } catch (e) {
            console.error(`💥 Network/System Error: ${e.message}`);
            errorsInRow++;
        }

        if (errorsInRow > 5) {
            console.error('🚨 Too many consecutive errors. Aborting migration safely.');
            break;
        }

        // Move to next batch
        offset += BATCH_SIZE;

        // Rate limit kindness
        await sleep(1000);
    }

    console.log('\n--- MIGRATION SUMMARY ---');
    console.log(`Total Processed: ${totalSuccess}`);
    console.log(`Total Skipped: ${totalSkipped}`);
    console.log(`Final Offset: ${offset}`);
}

runFullMigration();
