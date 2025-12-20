const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkHistory() {
    console.log("🔍 Inspecting Analytics History...");

    const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`\nFound ${data.length} total events.\n`);

    if (data.length > 0) {
        console.log(`First Event: ${new Date(data[0].created_at).toLocaleString()}`);
        console.log(`Last Event:  ${new Date(data[data.length - 1].created_at).toLocaleString()}`);
        console.log("\nDetails:");
        data.forEach(d => {
            console.log(`- [${new Date(d.created_at).toLocaleTimeString()}] ${d.company || ''} ${d.channel} (${d.entity_id})`);
        });
    } else {
        console.log("No events found.");
    }
}

checkHistory();
