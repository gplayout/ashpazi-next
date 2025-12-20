const fetch = require('node-fetch');
// We need to access Supabase to verify insertion. 
// We can reuse the logic from check_live_progress.js but for analytics_events

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim().replace(/"/g, '') : '';
};

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

console.log(`URL: ${SUPABASE_URL ? 'Loaded' : 'Missing'}`);
console.log(`KEY: ${SUPABASE_KEY ? 'Loaded (' + SUPABASE_KEY.slice(0, 5) + '...)' : 'Missing'}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyAnalytics() {
    console.log("🧪 Testing Analytics API & DB...");

    // 0. Direct DB Test to verify simple connectivity
    const directSlug = `direct-test-${Date.now()}`;
    const { error: directErr } = await supabase.from('analytics_events').insert({
        event_type: 'direct_test',
        entity_id: directSlug,
        metadata: { source: 'verification_script' }
    });

    if (directErr) {
        console.error("❌ DIRECT DB INSERT FAILED:", directErr);
        console.log("This means the script cannot write to DB. Check RLS or Keys.");
    } else {
        console.log("✅ Direct DB Insert Success.");
    }

    // 1. Send simulated event via API
    const testSlug = `test-click-${Date.now()}`;
    const payload = {
        slug: testSlug,
        channel: 'whatsapp-test',
        sku: 'premium-test'
    };

    try {
        const res = await fetch('http://localhost:3000/api/metrics/order-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const json = await res.json();
        console.log("API Response:", json);

        if (!json.success) throw new Error("API reported failure");

    } catch (e) {
        console.error("API Call Failed. Is server running?", e.message);
        return;
    }

    // 2. Wait for async write
    console.log("Waiting 2s for DB write...");
    await new Promise(r => setTimeout(r, 2000));

    // 3. Check DB
    const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('entity_id', testSlug)
        .single();

    if (error) {
        console.error("❌ DB Verification Failed:", error.message);
        console.log("Did you run the SQL migration?");
    } else if (data) {
        console.log("✅ SUCCESS! Event found in Supabase.");
        console.log("   ID:", data.id);
        console.log("   Event:", data.event_type);
        console.log("   Metadata:", data.metadata);
    } else {
        console.error("❌ Event not found in DB (Silent failure?)");
    }
}

verifyAnalytics();
