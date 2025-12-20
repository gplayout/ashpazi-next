
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log("Checking for 'chefs' table...");
    const { data: chefsData, error: chefsError } = await supabase
        .from('chefs')
        .select('*')
        .limit(1);

    if (chefsError) {
        console.log("Error accessing 'chefs' table:", chefsError.message);
        if (chefsError.code === '42P01') {
            console.log("Table 'chefs' DOES NOT EXIST.");
        }
    } else {
        console.log("Table 'chefs' exists. Sample:", chefsData);
    }

    // Also check if 'registry_recipes' has any chef info
    console.log("Checking 'registry_recipes' columns...");
    const { data: regData, error: regError } = await supabase
        .from('registry_recipes')
        .select('*')
        .limit(1);

    if (regError) {
        console.log("Error:", regError);
    } else {
        if (regData.length > 0) {
            console.log("Registry keys:", Object.keys(regData[0]));
        }
    }
}

checkSchema();
