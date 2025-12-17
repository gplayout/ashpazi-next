const fetch = require('node-fetch');

async function testMetric() {
    const url = 'http://localhost:3000/api/metrics/order-click';
    console.log("Testing POST to", url);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slug: 'qa-test-slug',
                channel: 'whatsapp',
                sku: 'QA Test SKU'
            })
        });

        const json = await res.json();
        console.log("Response:", res.status, json);
    } catch (e) {
        console.error("Failed to call API. Ensure server is running.", e.message);
    }
}

testMetric();
