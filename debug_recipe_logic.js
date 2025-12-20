
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// --- 1. MOCK UTILS ---
const getUiLabel = (key, lang) => `[LABEL: ${key} (${lang})]`;

const toPersianDigits = (n) => n.toString(); // simplified

// Mock useLanguage 't' function logic
// Based on: const t = (obj, field) => {...}
// Usually context implementation is:
/*
  const t = (obj, field) => {
    if (!obj || !obj.recipe_translations) return obj[field]; // Fallback to root
    const tr = obj.recipe_translations.find(t => t.language_code === language) 
               || obj.recipe_translations.find(t => t.language_code === 'en');
    return tr ? tr[field] : obj[field];
  }
*/
const mockT = (recipe, field, language) => {
    const translations = recipe.recipe_translations || [];
    const tr = translations.find(t => t.language_code === language)
        || translations.find(t => t.language_code === 'en');

    // IF found translation has the field, use it.
    // BUT we need to be careful. 'instructions' in DB might be JSON, but UI handles it?
    // Let's see what DB returns.
    if (tr && tr[field]) return tr[field];

    return recipe[field];
};

// --- 2. FETCH LOGIC (From actions.js) ---
async function fetchRecipes(page = 1, limit = 5) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 1. Fetch
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .not('image', 'is', null)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    if (!recipes || recipes.length === 0) return [];

    // 2. Map
    const recipeIds = recipes.map(r => r.id);
    const { data: registryMap, error: regError } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .in('legacy_recipe_id', recipeIds);

    if (regError) throw regError;

    const idToUuid = {};
    const uuids = [];
    registryMap.forEach(row => {
        idToUuid[row.legacy_recipe_id] = row.id;
        uuids.push(row.id);
    });

    // 3. Translations
    let translations = [];
    if (uuids.length > 0) {
        const { data: transData, error: transError } = await supabase
            .from('content_translations')
            .select('recipe_id, language_code, title, instructions, qa_metadata')
            .in('recipe_id', uuids);

        if (!transError && transData) translations = transData;
    }

    // 4. Stitch
    const enrichedRecipes = recipes.map(recipe => {
        const uuid = idToUuid[recipe.id];
        const matchingTranslations = translations.filter(t => t.recipe_id === uuid);
        return {
            ...recipe,
            recipe_translations: matchingTranslations || []
        };
    });

    return enrichedRecipes;
}

// --- 3. COMPONENT LOGIC (Mirrors RecipeCard.jsx) ---
const simulateRecipeCard = (recipe, language = 'en') => {
    console.log(`\n--- Simulating Recipe: ${recipe.name} [ID: ${recipe.id}] (${language}) ---`);

    // --- Description Resolution Logic (Unified Validator Pattern) ---
    const translations = recipe.recipe_translations || [];

    // 1. Content Extraction Helpers
    const isMostlyFarsi = (text) => {
        if (!text) return false;
        const farsiMatches = text.match(/[\u0600-\u06FF]/g);
        const count = farsiMatches ? farsiMatches.length : 0;
        return count > (text.length * 0.4); // >40% Farsi chars = Farsi
    };

    const extractText = (field) => {
        if (!field) return [];
        let raw = field;
        if (typeof raw === 'string') {
            try { raw = JSON.parse(raw); } catch { raw = [raw]; }
        }
        if (!Array.isArray(raw) && typeof raw === 'object') {
            raw = [raw];
        }
        if (!Array.isArray(raw)) return [];
        return raw.map(step => (typeof step === 'object' && step?.text) ? step.text : step)
            .filter(s => typeof s === 'string' && s.trim().length > 5);
    };

    // 2. Prepare Candidates (In Priority Order)
    const targetTr = translations.find(t => t.language_code === language);
    const enTr = language !== 'en' ? translations.find(t => t.language_code === 'en') : null;

    const candidates = [
        // Priority 1: Target Language Rich Description
        {
            text: targetTr?.qa_metadata?.marketing_description ||
                targetTr?.qa_metadata?.seo_meta_description ||
                targetTr?.seo_meta_description ||
                targetTr?.description,
            type: 'marketing'
        },
        // Priority 2: Target Language First Instruction
        {
            text: extractText(targetTr?.instructions)[0],
            type: 'instruction'
        },
        // Priority 3: English Rich Description (Fallback for other langs)
        {
            text: enTr?.qa_metadata?.marketing_description || enTr?.description,
            type: 'marketing'
        },
        // Priority 4: English First Instruction
        {
            text: extractText(enTr?.instructions)[0],
            type: 'instruction'
        },
        // Priority 5: Legacy Raw Data (Source of Truth for un-migrated data)
        {
            text: extractText(recipe.instructions)[0],
            type: 'legacy'
        }
    ];

    // 3. Selection Validator
    let finalDescription = null;
    let selectedStrategy = 'NONE';

    for (const candidate of candidates) {
        const text = candidate.text;

        console.log(`Checking Candidate [${candidate.type}]: "${text ? text.substring(0, 30) : 'NULL'}..." -> FarsiRatio: ${text ? (text.match(/[\u0600-\u06FF]/g) || []).length / text.length : 0}`);

        if (!text || text.startsWith('TEST_') || text.trim().length < 5) continue;
        if (text.startsWith('Step 1:')) continue;

        const isFarsi = isMostlyFarsi(text);

        if (language === 'fa') {
            finalDescription = text;
            selectedStrategy = candidate.type;
            break;
        } else {
            // English/German/etc Mode:
            // CRITICAL: REJECT Farsi content.
            if (!isFarsi) {
                finalDescription = text;
                selectedStrategy = candidate.type;
                break;
            } else {
                console.log(`  -> REJECTED (Too much Farsi)`);
            }
        }
    }

    if (!finalDescription) {
        finalDescription = "DEFAULT_DESC";
    }

    console.log(`RESULT: Strategy=${selectedStrategy}`);
    console.log(`        Final=${finalDescription.substring(0, 40)}...`);
};

// --- RUNNER ---
(async () => {
    try {
        const recipes = await fetchRecipes();
        console.log(`Fetched ${recipes.length} recipes.`);

        for (const r of recipes) {
            // simulateRecipeCard(r, 'de'); // Test German
            simulateRecipeCard(r, 'en'); // Test English
        }
    } catch (e) {
        console.error(e);
    }
})();
