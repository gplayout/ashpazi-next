import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listGenerated() {
    // Find recipes with images in the ai-gen folder
    const { data, error } = await supabase
        .from('recipes')
        .select('name, image')
        .ilike('image', '%/ai-gen/%')
        .limit(5);

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(r => {
        const slug = r.name.toLowerCase().replace(/\s+/g, '-');
        console.log(`RECIPE: ${r.name} | URL: http://localhost:3000/recipe/${encodeURIComponent(slug)}`);
    });
}

listGenerated();
