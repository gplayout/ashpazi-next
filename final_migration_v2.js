require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// --- CONFIGURATION ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';
const API_URL = 'http://localhost:3000/api/pipeline/translate';
const BATCH_SIZE = 5; // Process 5 at a time
const TARGET_LANG = 'en';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFullResetAndMigration() {
    console.log('🚀 INITIALIZING FULL MIGRATION V2 (Reset + Regenerate) 🚀');
    console.log('-------------------------------------------------------');

    // --- STEP 1: RESET DATABASE ---
    console.log('\n🗑️  PHASE 1: RESETTING DATABASE...');

    // 1. Delete all English translations (Fix: use language_code)
    console.log('   - Deleting ALL existing English translations...');
    const { error: deleteError } = await supabase
        .from('content_translations')
        .delete()
        .eq('language_code', 'en'); // FIXED: language -> language_code

    if (deleteError) {
        console.error('   ❌ Error deleting translations:', deleteError);
        // We continue anyway, as the API might just overwrite/skip
    } else {
        console.log('   ✅ Deleted English translations.');
    }

    // 2. Reset Pipeline State via API (Bypasses local schema cache issues)
    console.log('   - Resetting ALL recipes to "manual_retry" via API...');

    // Call the reset endpoint
    const resetUrl = `http://localhost:3000/api/pipeline/reset?secret=${SECRET}`;
    try {
        const resetRes = await fetch(resetUrl);
        const resetJson = await resetRes.json();
        if (!resetRes.ok || !resetJson.ok) throw new Error(resetJson.error || 'Reset failed');
        console.log('   ✅ Pipeline state reset for ALL recipes.');
    } catch (e) {
        console.error('   ❌ Error resetting recipes:', e.message);
        console.log('   ⚠️ Proceeding anyway (assuming some recipes are available)...');
    }

    // --- STEP 2: BATCH PROCESSING ---
    console.log('\n⚙️  PHASE 2: STARTING BATCH GENERATION');

    let offset = 0;
    let totalProcessed = 0;
    let errorsInRow = 0;
    let linksGenerated = [];
    const LINK_LIMIT = 10;
    const MAX_OFFSET = 2000; // Safety cap

    while (offset < MAX_OFFSET) {
        console.log(`\n🔄 Processing Batch (Offset ${offset})...`);

        try {
            // We iterate using offset because the API query includes both 'normalized_ok' and 'translated_en'.
            // So the list size is constant. We must move forward.
            const url = `${API_URL}?secret=${SECRET}&lang=${TARGET_LANG}&limit=${BATCH_SIZE}&offset=${offset}`; // Use 'offset' param

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            if (!data.ok) {
                console.error(`   ❌ Batch Failed: ${data.message || data.error}`);
                errorsInRow++;

                // If "No normalized recipes found", we are done (end of DB)
                if (data.message === 'No normalized recipes found') {
                    console.log('🎉 End of Database Reached! Migration Complete.');
                    break;
                }
            } else {
                const s = data.summary;
                console.log(`   ✅ Success: ${s.success} | Failed: ${s.failed} | Skipped: ${s.skipped}`);

                // Collect Links
                if (s.details && s.details.length > 0) {
                    for (const detail of s.details) {
                        if (detail.status === 'success') {
                            const link = `http://localhost:3000/recipe/${detail.id}`;
                            if (!linksGenerated.includes(link)) {
                                linksGenerated.push(link);
                                totalProcessed++;
                            }
                        } else if (detail.status === 'skipped') {
                            console.log(`      [Skipped] ${detail.id}: ${detail.reason}`);
                        }
                    }
                }

                errorsInRow = 0;

                // Show links if we have reached 10 new ones
                if (linksGenerated.length >= LINK_LIMIT && linksGenerated.length < LINK_LIMIT + BATCH_SIZE) {
                    console.log('\n✨ --- FIRST 10 RECIPES READY FOR REVIEW --- ✨');
                    linksGenerated.slice(0, 10).forEach((link, i) => console.log(`${i + 1}. ${link}`));
                    console.log('--------------------------------------------\n');
                }
            }

            if (errorsInRow > 5) {
                console.error('🚨 Too many consecutive errors. Aborting batch.');
                // Try skipping ahead just in case one batch is stuck?
                // offset += BATCH_SIZE;
                // But if system error, maybe just break.
                break;
            }

            // Always increment offset to process next batch
            offset += BATCH_SIZE;

            await sleep(1000);

        } catch (e) {
            console.error(`   💥 System Error: ${e.message}`);
            errorsInRow++;
            await sleep(3000);

            if (errorsInRow > 5) break;
        }
    }

    console.log('\n🏁 MIGRATION SCRIPT FINISHED');
    console.log(`Total Successfully Processed/Linked during this run: ${linksGenerated.length}`);
    if (linksGenerated.length > 0) {
        console.log('First 10 Links:');
        linksGenerated.slice(0, 10).forEach(l => console.log(l));
    }
}

runFullResetAndMigration();
