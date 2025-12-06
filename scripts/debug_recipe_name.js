import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log("Fetching recipe starting with 'سبزیجات پخته'...");
    // Fetch first recipe
    const { data, error } = await supabase.from('recipes').select('name').ilike('name', 'سبزیجات پخته%').limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (data && data.length > 0) {
        const name = data[0].name;
        console.log(`Found: "${name}"`);
        console.log("Char codes:", name.split('').map(c => c.charCodeAt(0)));

        // Simulate slug generation
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        console.log(`Generated Slug: "${slug}"`);
        console.log("Slug encoded:", encodeURIComponent(slug));
    } else {
        console.log("Recipe not found via ilike.");
    }
}

debug();
