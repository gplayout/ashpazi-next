import { supabase } from './supabase';
import { translationDB } from '@/utils/aiTranslation';
import { generateSlug } from '@/utils/slugUtils';

// Helper to find recipe by slug (Server Side)
export async function getRecipeBySlug(slug) {
    console.log(`[getRecipeBySlug] Lookup for slug: "${slug}"`);
    if (!slug) return null;

    // 1. Try to find if this slug matches an English name in our translation DB
    // In PWA, we generated slug FROM the English name.
    // So distinct recipes map to English names.
    // We reverse lookup: valid English Names -> generateSlug -> match input Slug -> Get Persian Name.

    let persianName = null;

    // Reverse search translationDB
    // This is O(N) but N is small (160 keys in old DB, maybe more now? Actually simple loop is fine for 1000 items)
    // Actually translationDB only has the 168 from before.
    // For the new 1200 recipes, we don't have translations yet.
    // So they will rely on direct slugification of their persian strings (which encode to ugly URLs usually, but work).

    // Check translationDB first
    for (const [pName, data] of Object.entries(translationDB)) {
        if (generateSlug(data.name) === slug) {
            persianName = pName;
            break;
        }
    }

    // If found, fetch by exact name
    if (persianName) {
        const { data } = await supabase.from('recipes').select('*').eq('name', persianName).single();
        if (data) return data;
    }

    // 2. If not found in translation DB, maybe the slug IS the Persian name (encoded)?
    // Try to decode
    const decoded = decodeURIComponent(slug);
    // Search by name (Assuming slug ~ name)
    // Supabase 'eq' matches exact.
    // Maybe 'ilike'?
    const { data: fuzzyData } = await supabase.from('recipes').select('*').ilike('name', decoded).single();
    if (fuzzyData) return fuzzyData;

    // 3. Try hyphen replacement (common slug pattern)
    // slug "ab-goosht" -> name "ab goosht"
    const spaced = decoded.replace(/-/g, ' ');
    console.log(`[getRecipeBySlug] Trying spaced name: "${spaced}"`);
    const { data: spaceData } = await supabase.from('recipes').select('*').ilike('name', spaced).single();
    if (spaceData) {
        console.log(`[getRecipeBySlug] Found by spaced name!`);
        return spaceData;
    }

    // 4. Try exact match on name (in case slug was exact name)
    const { data: exactData } = await supabase.from('recipes').select('*').eq('name', decoded).single();
    if (exactData) {
        console.log(`[getRecipeBySlug] Found by exact decoded name!`);
        return exactData;
    }

    console.log(`[getRecipeBySlug] GAVE UP for slug: "${slug}"`);
    return null;
}
