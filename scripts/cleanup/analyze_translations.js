const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function analyze() {
    console.log('Analyzing translations...');

    // 1. Get all translations
    const { data: all, error } = await supabase
        .from('content_translations')
        .select('language_code, confidence_score, publish_status, auto_published, ingredients');

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    if (!all || all.length === 0) {
        console.log('No translations found.');
        return;
    }

    // 2. Stats
    const stats = {
        total: all.length,
        byLang: {},
        avgConfidence: 0,
        publishedCount: 0,
        manualDraftCount: 0,
        missingIngredients: 0
    };

    let totalScore = 0;

    all.forEach(t => {
        // Lang breakdown
        stats.byLang[t.language_code] = (stats.byLang[t.language_code] || 0) + 1;

        // Confidence
        if (t.confidence_score) totalScore += t.confidence_score;

        // Status
        if (t.publish_status === 'published') stats.publishedCount++;
        else stats.manualDraftCount++;

        // Integrity check (simple)
        if (!t.ingredients || t.ingredients.length === 0) stats.missingIngredients++;
    });

    stats.avgConfidence = (totalScore / stats.total).toFixed(4);

    console.log('\n--- Analysis Result ---');
    console.log('Total Translations:', stats.total);
    console.log('Language Breakdown:', JSON.stringify(stats.byLang));
    console.log('Average Confidence Score:', stats.avgConfidence);
    console.log('Published (Auto/Manual):', stats.publishedCount);
    console.log('Drafts (Pending Review):', stats.manualDraftCount);
    console.log('Records with NO Ingredients (Warning):', stats.missingIngredients);
    console.log('-----------------------');
}

analyze();
