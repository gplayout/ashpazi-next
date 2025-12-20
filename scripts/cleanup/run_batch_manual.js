const fetch = require('node-fetch');

async function runBatch(lang = 'fr', limit = 1000) {
    const baseUrl = 'http://localhost:3000/api/pipeline/translate';
    const secret = 'ashpazi-pipeline';
    let offset = 0;
    const batchSize = 5;
    let totalSuccess = 0;

    console.log(`Starting Robust Batch for [${lang}]...`);

    // We will loop until we hit a break condition
    while (true) {
        try {
            console.log(`Processing Batch [Offset ${offset}]...`);
            const res = await fetch(`${baseUrl}?secret=${secret}&lang=${lang}&offset=${offset}`);

            if (!res.ok) {
                console.error(`Batch Failed: ${res.status} ${res.statusText}`);
                console.log('⚠️ Skipping bad batch and continuing...');
                offset += batchSize;
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }

            const data = await res.json();

            if (data.summary) {
                const { success, skipped, failed } = data.summary;
                totalSuccess += success;
                console.log(`   -> Success=${success}, Skipped=${skipped}, Failed=${failed}`);
            } else {
                console.log('ℹ️ No summary returned (Empty range?)');
            }

            // Hard limit check (Legacy IDs go up to ~1600, let's go to 2000 safety)
            if (offset > 2000) {
                console.log('✅ Reached end of DB scope. Finished.');
                break;
            }

            // Increment offset
            offset += batchSize;

            // Rate limit protection
            await new Promise(r => setTimeout(r, 500));

        } catch (error) {
            console.error('Network/Script Error:', error.message);
            console.log('Waiting 5s before retry...');
            await new Promise(r => setTimeout(r, 5000));
        }
    }
    console.log(`\nCommand Finished. Total New Translations: ${totalSuccess}`);
}

runBatch('fr', 2000);
