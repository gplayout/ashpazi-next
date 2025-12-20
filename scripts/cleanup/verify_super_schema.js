
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
    console.log("Fetching Recipe 1541 metadata...");
    const { data: reg } = await supabase.from('registry_recipes').select('id').eq('legacy_recipe_id', 1541).single();

    const { data } = await supabase
        .from('content_translations')
        .select('qa_metadata')
        .eq('recipe_id', reg.id)
        .eq('language_code', 'en')
        .single();

    if (!data || !data.qa_metadata) {
        console.error("No metadata found!");
        return;
    }

    const m = data.qa_metadata;
    console.log("--- RICH CONTENT VERIFICATION ---");
    console.log("SEO Keywords:", m.seo_keywords);
    console.log("Social Hook:", m.social_share_copy);
    console.log("Flavor Profile:", m.flavor_profile);
    console.log("Dietary Tags:", m.dietary_tags);
    console.log("Cost:", m.estimated_cost);
    console.log("Substitutions:", JSON.stringify(m.ingredient_substitutions, null, 2));
    console.log("---------------------------------");
}

verify();
