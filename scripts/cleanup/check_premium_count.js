const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkHighScores() {
    // Check for "Premium" candidates (Score > 85)
    const { count, error } = await supabase
        .from('content_translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'en')
        // JSON syntax for querying inside qa_metadata -> internal_score -> marketing_joy_score
        // Note: Supabase JS client filter syntax for JSON can be tricky, 
        // sometimes it's easier to fetch a batch and count in JS if the volume is low,
        // or use the arrow operator if configured in PostgREST. 
        // For safety/simplicity in this quick check, I'll fetch the remastered ones and filter in JS.
        .not('qa_metadata', 'is', null);

    if (error) {
        console.error(error);
        return;
    }

    // Since we can't easily filter deep JSON with simple .eq() in client without specialized indices sometimes,
    // let's fetch a chunk and estimate or try a raw query if needed. 
    // Actually, let's just fetch the ones that have metadata and verify locally for this status check.
    // To avoid fetching 1500 rows, let's limit to 1000 and see the ratio.

    const { data: recipes } = await supabase
        .from('content_translations')
        .select('qa_metadata')
        .eq('language_code', 'en')
        .not('qa_metadata', 'is', null)
        .limit(1000);

    const highQuality = recipes.filter(r => {
        const score = r.qa_metadata?.internal_score?.marketing_joy_score;
        return score && score > 85;
    });

    console.log(`\n💎 Premium Candidates (Score > 85): ${highQuality.length}`);
    console.log(`📊 Total Remastered Scanned: ${recipes.length}`);
}

checkHighScores();
