'use server'

import { createClient } from '@supabase/supabase-js';

// CRITICAL: Use Service Role Key to bypass RLS on server actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
    console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY is missing in actions.js!");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// import { supabase } from '@/lib/supabase'; // <-- OLD (RLS Blocked)

/**
 * Fetches recipes with correct translation stitching.
 * 
 * PROBLEM: 'recipes' table uses Integer ID. 'content_translations' uses UUID.
 * There is no direct FK. We must go through 'registry_recipes'.
 * 
 * STRATEGY: "Second Hop Fetch" (Application-Layer Join)
 * 1. Fetch Page of Recipes (Legacy Table)
 * 2. Fetch UUID mappings from Registry
 * 3. Fetch Translations using UUIDs
 * 4. Stitch in memory
 */
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRecipes(page = 1, limit = 24) {
    noStore(); // Opt out of static caching
    // Smart Feed Strategy: Fetch 3x items to ensure good "Elite" candidates bubble up
    const fetchLimit = limit * 3;
    const from = (page - 1) * fetchLimit;
    const to = from + fetchLimit - 1;
    console.log(`[FetchRecipes] Page ${page} (ZipperFeed), fetching ${fetchLimit} candidates...`);

    // 1. Fetch Recipes (Legacy Data)
    // NOTE: Removed broken join `select('*, recipe_translations(*)')`
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .not('image', 'is', null) // Consistency check
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }

    if (!recipes || recipes.length === 0) return [];

    // 2. Fetch Registry Mapping (Integer ID -> UUID)
    const recipeIds = recipes.map(r => r.id);
    const { data: registryMap, error: regError } = await supabase
        .from('registry_recipes')
        .select('legacy_recipe_id, id')
        .in('legacy_recipe_id', recipeIds);

    if (regError) {
        console.error('Error fetching registry map:', regError);
        // Fallback: return recipes without translations
        return recipes.map(r => ({ ...r, recipe_translations: [] }));
    }

    // Create Map: LegacyID -> UUID
    const idToUuid = {};
    const uuids = [];
    registryMap.forEach(row => {
        idToUuid[row.legacy_recipe_id] = row.id;
        uuids.push(row.id);
    });

    // 3. Fetch Translations (Using UUIDs)
    let translations = [];
    if (uuids.length > 0) {
        const { data: transData, error: transError } = await supabase
            .from('content_translations')
            .select('recipe_id, language_code, title, instructions, qa_metadata') // rich content
            .in('recipe_id', uuids);

        if (!transError && transData) {
            translations = transData;
        }
    }

    // 4. Stitch Data (In-Memory Join)
    const enrichedRecipes = recipes.map(recipe => {
        const uuid = idToUuid[recipe.id];
        const matchingTranslations = translations.filter(t => t.recipe_id === uuid);

        return {
            ...recipe,
            recipe_translations: matchingTranslations
        };
    });

    // --- HELPER: Seasonal Logic ---
    const SEASONAL_EVENTS = [
        // Winter / Spring
        { name: 'Chinese New Year', start: '01-20', end: '02-20', keywords: ['Dumpling', 'Noodle', 'Fish', 'Spring Roll'] },
        { name: 'Valentine', start: '02-10', end: '02-15', keywords: ['Chocolate', 'Heart', 'Red Velvet', 'Cake'] },
        { name: 'Rio Carnival', start: '02-20', end: '03-05', keywords: ['Feijoada', 'Brigadeiro', 'Caipirinha'] },
        { name: 'Ramadan', start: '02-28', end: '03-30', keywords: ['Date', 'Soup', 'Ash', 'Haleem', 'Samosa'] },
        { name: 'Nowruz', start: '03-15', end: '04-01', keywords: ['Sabzi Polo', 'Mahi', 'Kuku', 'Haft Sin', 'Samanu'] },
        { name: 'Easter', start: '03-25', end: '04-15', keywords: ['Egg', 'Lamb', 'Bun', 'Chocolate'] },
        { name: 'Eid al-Fitr', start: '03-29', end: '04-05', keywords: ['Sweet', 'Sheer Khurma', 'Maamoul'] },

        // Summer
        { name: 'Cinco de Mayo', start: '05-01', end: '05-06', keywords: ['Taco', 'Guacamole', 'Margarita'] },
        { name: 'Bastille Day', start: '07-10', end: '07-15', keywords: ['Tart', 'Croissant', 'Ratatouille'] },

        // Autumn
        { name: 'Oktoberfest', start: '09-15', end: '10-05', keywords: ['Pretzel', 'Sausage', 'Schnitzel', 'Potato'] },
        { name: 'Diwali', start: '10-20', end: '11-15', keywords: ['Sweet', 'Ladoo', 'Curry', 'Paneer'] },
        { name: 'Halloween', start: '10-25', end: '11-01', keywords: ['Pumpkin', 'Candy', 'Ghost', 'Spider'] },
        { name: 'Thanksgiving', start: '11-15', end: '11-30', keywords: ['Turkey', 'Pumpkin', 'Pie', 'Cranberry'] },

        // Winter
        { name: 'Hanukkah', start: '12-18', end: '12-30', keywords: ['Latke', 'Donut', 'Brisket'] },
        { name: 'Christmas', start: '12-15', end: '12-26', keywords: ['Roast', 'Cookie', 'Cake', 'Eggnog', 'Log'] },
    ];

    const getSeasonalBoost = (recipe) => {
        const today = new Date();
        // Format MM-DD for comparison
        const format = (d) => d.toISOString().slice(5, 10); // "MM-DD"
        const now = format(today);

        let boost = 0;

        // Check if ANY translation title or keywords match
        // Note used: translation title or qa_metadata.keywords
        const textToScan = recipe.recipe_translations?.map(t =>
            (t.title + ' ' + (t.qa_metadata?.marketing_description || '')).toLowerCase()
        ).join(' ') || '';

        for (const event of SEASONAL_EVENTS) {
            let isActive = false;
            // Handle Year Wrap (e.g. Dec 25 to Jan 05)
            if (event.start < event.end) {
                isActive = (now >= event.start && now <= event.end);
            } else {
                isActive = (now >= event.start || now <= event.end);
            }

            if (isActive) {
                // Check Keywords
                const match = event.keywords.some(k => textToScan.includes(k.toLowerCase()));
                if (match) {
                    console.log(`[Seasonal Boost] ${recipe.id} boosted for ${event.name}`);
                    boost = 100;
                    break;
                }
            }
        }
        return boost;
    };

    const getScore = (r) => {
        const base = r.recipe_translations?.[0]?.qa_metadata?.internal_score?.marketing_joy_score || 0;
        return base + getSeasonalBoost(r);
    };

    // 5. Smart Feed Strategy: "The Zipper" (50% Elite, 50% Discovery)

    // 5. Smart Feed Strategy: "The Multicultural Zipper" 
    // Goal: High Scores + High Diversity (No domination by one cuisine)

    const getCulture = (r) => {
        // Try to infer culture/region from metadata or title
        // This is a heuristic based on keywords since structured 'origin' might be sparse
        const text = (r.recipe_translations?.[0]?.title + ' ' + (r.recipe_translations?.[0]?.qa_metadata?.marketing_description || '')).toLowerCase();

        if (text.includes('iran') || text.includes('persian') || text.includes('saffron')) return 'Persian';
        if (text.includes('china') || text.includes('chinese') || text.includes('noodle') || text.includes('soy')) return 'Asian';
        if (text.includes('india') || text.includes('curry') || text.includes('masala')) return 'Indian';
        if (text.includes('pasta') || text.includes('pizza') || text.includes('italian')) return 'Italian';
        if (text.includes('mexic') || text.includes('taco')) return 'Mexican';
        if (text.includes('french') || text.includes('paris') || text.includes('tart')) return 'French';
        if (text.includes('burger') || text.includes('bbq') || text.includes('steak')) return 'American';
        if (text.includes('german') || text.includes('wurst')) return 'German';
        if (text.includes('brazil') || text.includes('feijoada')) return 'Brazilian';

        return 'Global'; // Default bucket
    };

    // Sort all by score first
    const sortedByScore = [...enrichedRecipes].sort((a, b) => getScore(b) - getScore(a));

    // Bucket into Cultures
    const cultureBuckets = {};
    sortedByScore.forEach(r => {
        const c = getCulture(r);
        if (!cultureBuckets[c]) cultureBuckets[c] = [];
        cultureBuckets[c].push(r);
    });

    // Round-Robin Selection for "Elite" items
    // We want the top ~12 items to be diverse
    const eliteBucket = [];
    const usedIds = new Set();
    const cultures = Object.keys(cultureBuckets);
    const halfLimit = Math.floor(limit / 2);

    let loopIndex = 0;
    while (eliteBucket.length < halfLimit && loopIndex < 100) { // Safety break
        for (const c of cultures) {
            if (eliteBucket.length >= halfLimit) break;

            // Find next unused item in this culture
            const candidate = cultureBuckets[c].find(r => !usedIds.has(r.id));
            if (candidate) {
                eliteBucket.push(candidate);
                usedIds.add(candidate.id);
            }
        }
        loopIndex++;
    }

    // Fill remaining spots if diversification ran out of items
    if (eliteBucket.length < halfLimit) {
        for (const r of sortedByScore) {
            if (eliteBucket.length >= halfLimit) break;
            if (!usedIds.has(r.id)) {
                eliteBucket.push(r);
                usedIds.add(r.id);
            }
        }
    }

    // Bucket B: Discovery (The rest of the pool, shuffled)
    const remainingPool = enrichedRecipes.filter(r => !usedIds.has(r.id));

    // Shuffle remaining (Fisher-Yates)
    for (let i = remainingPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingPool[i], remainingPool[j]] = [remainingPool[j], remainingPool[i]];
    }

    const discoveryBucket = remainingPool.slice(0, limit - eliteBucket.length);

    // 6. Zip them together (Elite, Discovery, Elite, Discovery...)
    const finalList = [];
    const maxLen = Math.max(eliteBucket.length, discoveryBucket.length);

    for (let i = 0; i < maxLen; i++) {
        if (eliteBucket[i]) finalList.push(eliteBucket[i]);
        if (discoveryBucket[i]) finalList.push(discoveryBucket[i]);
    }

    // CRITICAL: Ensure serializability
    return JSON.parse(JSON.stringify(finalList));
}
