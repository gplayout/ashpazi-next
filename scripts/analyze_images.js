import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeImages() {
    console.log("📸 Analyzing Image Coverage...");

    // Count Total
    const { count: total, error: errTp } = await supabase.from('recipes').select('*', { count: 'exact', head: true });

    // Count with Images
    const { count: withImg, error: errImg } = await supabase.from('recipes').select('*', { count: 'exact', head: true }).not('image', 'is', null);

    if (errTp || errImg) {
        console.error("Error fetching counts:", errTp, errImg);
        return;
    }

    const missing = total - withImg;
    console.log(`--------------------------------`);
    console.log(`Total Recipes: ${total}`);
    console.log(`With Images:   ${withImg}`);
    console.log(`Missing Aks:   ${missing}`);
    console.log(`--------------------------------`);
}

analyzeImages();
