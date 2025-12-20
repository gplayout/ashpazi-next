
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Force load .env.local
dotenv.config({ path: '.env.local' });

import { QualificationAgent } from './src/lib/growth/agents/qualification-agent.js';
import { SkuAgent } from './src/lib/growth/agents/sku-agent.js';

// Load Mock Data
const mockDataPath = path.join(process.cwd(), 'src/lib/growth/mock_leads.json');
const rawLeads = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

async function run() {
    console.log("🚀 Starting Zaffaron Discovery Engine Simulation...\n");

    const qualifier = new QualificationAgent();
    const skuGenerator = new SkuAgent();

    console.log(`📥 Loaded ${rawLeads.length} Raw Leads from Mock Data.`);

    for (const lead of rawLeads) {
        console.log(`\n🔍 Analyzing: ${lead.handle}...`);

        // 1. Qualification Phase
        const qResult = await qualifier.qualify(lead);
        console.log(`   > Score: ${qResult.score}/100 | Type: ${qResult.chef_type} | Qualified: ${qResult.is_qualified ? '✅' : '❌'}`);
        console.log(`   > Reason: ${qResult.reasoning}`);

        if (qResult.is_qualified) {
            // 2. SKU Phase (Only if qualified)
            console.log(`   > 🍳 Generating SKUs (Menu)...`);
            const skus = await skuGenerator.generateSkus(lead);

            console.log(`   > 📦 Generated ${skus.length} Shadow SKUs:`);
            skus.forEach(sku => {
                console.log(`      - [${sku.title}] (${sku.price_detected || sku.suggested_price_range})`);
                console.log(`        "${sku.description}"`);
            });

            // 3. Outreach Preview (Draft)
            console.log(`   > 💌 Outreach Draft:`);
            console.log(`      "Hi ${lead.handle}, loved your ${skus[0]?.title}! We pre-built a shop page for you..."`);
        }
    }

    console.log("\n✅ Simulation Complete.");
}

run();
