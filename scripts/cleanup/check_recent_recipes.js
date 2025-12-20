
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getRecentLinks() {
    console.log("🔍 Fetching 5 recently updated recipes...");

    // 1. Get 5 recent EN translations
    // We order by inserted_at or assume any 5 are fine since we wiped them all
    const { data: translations, error } = await supabase
        .from('content_translations')
        .select(`
            recipe_id,
            title,
            qa_metadata
        `)
        .eq('language_code', 'en')
        .limit(5);

    if (error) {
        console.error("Error fetching translations:", error);
        return;
    }

    if (!translations || translations.length === 0) {
        console.log("No translations found.");
        return;
    }

    console.log("\n🔗 HERE ARE 5 LIVE LINKS TO VERIFY:\n");

    for (const t of translations) {
        // 2. Resolve Legacy ID/Slug
        const { data: reg } = await supabase
            .from('registry_recipes')
            .select('legacy_recipe_id')
            .eq('id', t.recipe_id)
            .single();

        if (reg) {
            // 3. Get Slug (name_en) from recipes
            const { data: recipe } = await supabase
                .from('recipes')
                .select('name_en, id')
                .eq('id', reg.legacy_recipe_id)
                .single();

            if (recipe) {
                // Slugify: Replace spaces/special chars with dashes for better URL matching
                const rawName = recipe.name_en || t.title;
                const slug = rawName.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '-');

                console.log(`Title: ${t.title}`);
                console.log(`Slug Link: http://localhost:3000/recipe/${slug}`);
                console.log(`ID Link:   http://localhost:3000/recipe/${recipe.id}`); // Fallback
                console.log(`Legacy ID: ${recipe.id}`);
                console.log("---------------------------------------------------");
            }
        }
    }
}

getRecentLinks();
