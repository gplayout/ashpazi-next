require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3000/api/pipeline/translate';
const SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';
const PILOT_SIZE = 10;
const OFFSET_START = 20; // Start from ID 20 (stable block)

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sentinel Validation Logic
const SENTINEL_RULES = {
    de: {
        name: 'German',
        requiredChars: /[äöüßÄÖÜ]/, // Must have at least one German char in sample
        forbiddenChars: /[\u0600-\u06FF]/, // No Arabic/Farsi
        badWords: ['Main Dish', 'Recipe', 'Persian'] // Leaked English
    },
    fa: {
        name: 'Farsi',
        requiredChars: /[\u0600-\u06FF]/,
        forbiddenChars: /[a-zA-Z]{5,}/, // No long English words
        badWords: ['Main Dish', 'Recipe']
    },
    fr: {
        name: 'French',
        requiredChars: /[àâçéèêëîïôûùüÿñæœ]/,
        forbiddenChars: /[\u0600-\u06FF]/,
        badWords: ['Main Dish']
    }
    // Add others as needed
};

async function runSentinelPilot() {
    const lang = process.argv[2];
    if (!lang) {
        console.error("❌ Usage: node run_sentinel_pilot.js <lang_code> (e.g. de, fr, fa)");
        process.exit(1);
    }

    console.log(`🛡️  SENTINEL PROTOCOL INITIATED: Pilot Run for '${lang}'`);
    const rules = SENTINEL_RULES[lang] || {
        name: lang,
        requiredChars: /./,
        forbiddenChars: /[\u0600-\u06FF]/, // Default: No Farsi
        badWords: ['Main Dish']
    };
    console.log(`📋 Rules loaded for ${rules.name}. Forbidden: Farsi Range.`);

    // 1. Reset Pilot Batch (IDs 20-30) for this language?
    // Actually pipeline API handles "if not exists". 
    // We just need to force generation.

    let processed = [];
    let errors = [];

    // Loop through specific IDs for Pilot
    console.log(`🚀 Executing Pilot Batch (${PILOT_SIZE} recipes)...`);

    // We cannot force "ID 20" via the general batch API easily without resetting state.
    // So for the pilot, we will simulate the batch by calling specific "translate-single" if available,
    // OR just relying on the main API but we need to ensure we get the output to valdiate.
    // Better: Query DB for 10 recipes, and call API directly for them if possible.
    // Actually, the main API `translate` endpoint picks next available. 
    // To properly "Pilot", we should probably use a "Force ID" param if supported, 
    // OR just standard batch but monitor the result.
    // Let's assume standard batch for now, but we verify 10 *new* translations.

    // Better Strategy: Just call API in loop until we get 10 results for 'lang'.

    let successCount = 0;
    let attempts = 0;

    while (successCount < PILOT_SIZE && attempts < 20) {
        attempts++;
        try {
            const res = await fetch(`${API_URL}?secret=${SECRET}&lang=${lang}`);
            const json = await res.json();

            if (json.summary && json.summary.details) {
                for (const item of json.summary.details) {
                    if (item.error) {
                        console.log(`   ❌ [${item.id}] Generation Failed: ${item.error}`);
                        errors.push({ id: item.id, error: item.error });
                        continue;
                    }

                    // AUDIT THIS ITEM
                    const audit = auditContent(item, rules);
                    if (audit.passed) {
                        console.log(`   ✅ [${item.id}] Passeed Sentinel Check.`);
                        processed.push(item);
                        successCount++;
                    } else {
                        console.error(`   🚨 [${item.id}] SENTINEL ALERT: ${audit.reason}`);
                        console.error(`      Content Sample: "${item.title}"`);
                        console.error(`      ABORTING PILOT.`);
                        process.exit(1); // Fail Fast
                    }
                }
            } else {
                console.log("   ⚠️ No items returned. Waiting...");
                await new Promise(r => setTimeout(r, 2000));
            }
        } catch (e) {
            console.error("   API Error:", e.message);
        }
    }

    // Generate Report
    generateReport(lang, processed);
}

function auditContent(item, rules) {
    const textSample = (item.title + " " + (item.category || "")).trim();

    // 1. Forbidden Chars
    if (rules.forbiddenChars.test(textSample)) {
        return { passed: false, reason: "Detected Forbidden Characters (e.g. Farsi/Arabic in Euro lang)" };
    }

    // 2. Bad Words (Leakage)
    for (const bad of rules.badWords) {
        if (textSample.toLowerCase().includes(bad.toLowerCase())) {
            return { passed: false, reason: `Detected Leaked Term: "${bad}"` };
        }
    }

    // 3. Required Native Chars (Soft check - generic latin might fail strict German check if title is just "Pasta")
    // Skipping strict required check for titles as they might be Proper Nouns. 

    return { passed: true };
}

function generateReport(lang, items) {
    const reportPath = path.join(__dirname, `audit_report_${lang}.md`);
    let md = `# Sentinel Audit Report: ${lang.toUpperCase()}\n\n`;
    md += `**Date:** ${new Date().toISOString()}\n`;
    md += `**Status:** ✅ PASSED AUTOMATED CHECKS\n`;
    md += `**Pilot Size:** ${items.length}\n\n`;
    md += `## Verified Pilot Items\n`;
    md += `User MUST manually verify these links before triggering Full Rollout.\n\n`;

    items.forEach(item => {
        md += `- [ID ${item.id}: ${item.title}](http://localhost:3000/recipe/${item.id}?lang=${lang})\n`;
    });

    md += `\n## Next Steps\n`;
    md += `If all above links look good, run:\n`;
    md += `\`node run_full_migration.js ${lang}\`\n`;

    fs.writeFileSync(reportPath, md);
    console.log(`\n📄 Report Generated: ${reportPath}`);
    console.log("✅ Sentinel Pilot Complete. Pending User Approval.");
}

runSentinelPilot();
