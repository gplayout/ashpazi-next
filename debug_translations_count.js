require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTranslations() {
    // Check count of 'en'
    const { count: countEn, error: errEn } = await supabase
        .from('content_translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'en');

    console.log(`Count 'en': ${countEn} (Error: ${errEn?.message})`);

    // Check count of 'en-US'
    const { count: countEnUS, error: errEnUS } = await supabase
        .from('content_translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'en-US');

    console.log(`Count 'en-US': ${countEnUS}`);

    // Check total
    const { count: total, error: errTotal } = await supabase
        .from('content_translations')
        .select('*', { count: 'exact', head: true });

    console.log(`Total translations: ${total}`);

    // Fetch a few skipped ones to see what language they are
    // We assume ID 6, 7... were skipped.
    // Let's fetch translations for recipe_id relating to legacy_id 6?
    // Hard to map without registry.
    // Just fetch 5 random translations.
    const { data: sample } = await supabase
        .from('content_translations')
        .select('language_code, recipe_id')
        .limit(5);
    console.log('Sample:', sample);
}

checkTranslations();
