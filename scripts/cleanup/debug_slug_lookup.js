const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugSlug() {
    const slug = "Premium Cantonese-Style Egg Fried Rice with Jasmine Rice"; // Approximate slug from title
    // Normalize logic from data.js
    // const normalized = decodeURIComponent(slug).replace(/-/g, ' '); 
    // User title was "Premium Cantonese-Style Egg Fried Rice with Jasmine Rice"
    // Let's assume the slug is something close or the name matches directly.

    const normalized = slug;
    console.log(`[Simulate] Looking up: "${normalized}"`);

    // Tier 2: Check Translations
    const { data: trans } = await supabase
        .from('content_translations')
        .select('recipe_id, title')
        .eq('publish_status', 'published')
        .or(`title.ilike.${normalized},title.eq.${normalized}`)
        .maybeSingle();

    if (trans) {
        console.log("✅ Tier 2 Match (Translation):", trans.recipe_id, trans.title);
    } else {
        console.log("❌ Tier 2: No translation match.");
    }

    // Tier 3: Legacy Recipes
    const { data: legacy } = await supabase
        .from('recipes')
        .select('id, name')
        .or(`name.ilike.${normalized},name.eq.${normalized},name_en.ilike.${normalized},name_en.eq.${normalized}`)
        .maybeSingle();

    if (legacy) {
        console.log("⚠️ Tier 3 Match (Legacy):", legacy.id, legacy.name);

        // Tier 3.5: Check upgrade
        const { data: upgrade } = await supabase
            .from('registry_recipes')
            .select(`
                id,
                content_translations(title, language_code)
            `)
            .eq('legacy_recipe_id', legacy.id)
            .eq('content_translations.language_code', 'en')
            .maybeSingle();

        if (upgrade?.content_translations?.[0]) {
            console.log("✅ Tier 3.5 Upgrade Available:", upgrade.content_translations[0].title);
        } else {
            console.log("❌ Tier 3.5: No upgrade found for Legacy ID", legacy.id);
            // Check if 1541 is related?
            if (legacy.id === 1541) console.log("   (But this IS ID 1541... why no translation?)");
        }
    } else {
        console.log("❌ Tier 3: No legacy match for slug.");
    }

    // Reverse Check: What is the name of ID 1541?
    const { data: idCheck } = await supabase.from('recipes').select('name, name_en').eq('id', 1541).single();
    if (idCheck) {
        console.log(`\nReverse Lookup 1541: "${idCheck.name_en || idCheck.name}"`);
    }
}

debugSlug();
