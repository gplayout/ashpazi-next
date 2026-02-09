
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectTable() {
    console.log("Steps:");
    const { data: s, error: se } = await supabase.from('recipe_steps').select('*').limit(1);
    if (s && s.length) console.log(Object.keys(s[0]));

    console.log("Translations:");
    const { data: t, error: te } = await supabase.from('content_translations').select('*').limit(1);
    if (t && t.length) console.log(Object.keys(t[0]));

    if (se) console.error("Steps Error:", se.message);
    if (te) console.error("Translations Error:", te.message);
}

inspectTable();
