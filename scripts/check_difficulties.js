
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDifficulties() {
    console.log("Fetching distinct difficulties...");

    // Fetch all difficulties (inefficient but safe for 1500 rows)
    const { data, error } = await supabase
        .from('recipes')
        .select('difficulty, category');

    if (error) {
        console.error("Error:", error);
        return;
    }

    const distinct = {};
    data.forEach(r => {
        const d = r.difficulty ? r.difficulty.trim() : 'NULL';
        if (!distinct[d]) distinct[d] = 0;
        distinct[d]++;
    });

    console.log("\nDistinct Difficulty Values:");
    console.table(distinct);
}

checkDifficulties();
