
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateReport() {
    console.log("📊 Generating Calibration Report...");

    const { data, error } = await supabase
        .from('content_translations')
        .select('id, recipe_id, confidence_score, qa_metadata, publish_status, last_updated')
        .order('last_updated', { ascending: false });

    if (error) {
        console.error("Fetch failed:", error.message);
        return;
    }

    if (data.length === 0) {
        console.log("No translations found.");
        return;
    }

    console.log(`Found ${data.length} records.\n`);
    console.log("ID   | Score | Status    | LenRatio | FmtScore | Lang | Glossary | Full Meta");
    console.log("-----|-------|-----------|----------|----------|------|----------|----------");

    data.forEach(row => {
        const meta = row.qa_metadata || {};
        const len = meta.length_score?.toFixed(2) || "N/A";
        const fmt = meta.fmt_score?.toFixed(2) || "N/A";
        const lang = meta.lang_score || "N/A";
        // glossary_score might be present or placeholder
        const glossary = meta.glossary_score?.toFixed(2) || "N/A";

        console.log(
            `${row.id}`.padEnd(5) + " | " +
            `${row.confidence_score?.toFixed(2)}`.padEnd(5) + " | " +
            `${row.publish_status}`.padEnd(9) + " | " +
            `${len}`.padEnd(8) + " | " +
            `${fmt}`.padEnd(8) + " | " +
            `${lang}`.padEnd(4) + " | " +
            `${glossary}`.padEnd(8) + " | " +
            JSON.stringify(meta)
        );
    });

    // Calc simple stats
    const scores = data.map(r => r.confidence_score).filter(s => s !== null);
    if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        console.log(`\nAverage Confidence Score: ${avg.toFixed(3)}`);
        console.log(`Total Drafts: ${data.filter(r => r.publish_status === 'draft').length}`);
        console.log(`Total Published: ${data.filter(r => r.publish_status === 'published').length}`);
    }
}

generateReport();
