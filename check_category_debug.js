
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCategory() {
    const id = '105072e6-2a22-4642-b49f-6d70b5e26f7e'; // One of the random ones
    const { data, error } = await client
        .from('content_translations')
        .select('qa_metadata')
        .eq('recipe_id', id)
        .eq('language_code', 'de')
        .single();

    if (data) {
        console.log("Raw Category in DB:", data.qa_metadata?.category);
    } else {
        console.log("Error or no data:", error);
    }
}

checkCategory();
