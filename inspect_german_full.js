
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectDe() {
    // 1061 is Khoresht Piazagh
    const { data: upgrade } = await client
        .from('registry_recipes')
        .select(`
            content_translations(
                title, 
                ingredients, 
                instructions, 
                qa_metadata,
                language_code,
                publish_status
            )
        `)
        .eq('legacy_recipe_id', 1061)
        .maybeSingle();

    if (!upgrade) return;

    const de = upgrade.content_translations.find(t => t.language_code === 'de');
    if (de) {
        console.log("🇩🇪 German Content:");
        console.log("Title:", de.title);
        console.log("Ingredients Type:", typeof de.ingredients);
        console.log("Ingredients Length:", de.ingredients?.length);
        console.log("Instructions Type:", typeof de.instructions);
        console.log("Instructions Length:", de.instructions?.length);
        console.log("Instructions Sample:", JSON.stringify(de.instructions?.[0]));

        const hasTranslation = de.title && (de.qa_metadata?.marketing_description || (de.ingredients && de.ingredients.length > 0));
        console.log("Passes hasTranslation check?", hasTranslation);
    } else {
        console.log("No German content found.");
    }
}

inspectDe();
