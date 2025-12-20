require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const JSON_PATH = path.join(__dirname, 'ashpazi_cleaned.json');
const API_URL = 'http://localhost:3000/api/pipeline/translate';
const SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateMissing17() {
    console.log("🚀 Starting Phase 2: Generating Missing Recipes (IDs 1-17)...");

    // Hardcoded Rescue List
    const targets = [
        { id: 1, title: 'Salad Shirazi' },
        { id: 2, title: 'Mast-o-Khiar (Persian Cucumber Yogurt)' },
        { id: 3, title: 'Mast-o-Mousir (Shallot Yogurt)' },
        { id: 4, title: 'Kashk-e-Bademjan (Eggplant Dip)' },
        { id: 5, title: 'Mirza Ghasemi (Smoked Eggplant)' },
        { id: 6, title: 'Kuku Sabzi (Fresh Herb Frittata)' },
        { id: 7, title: 'Kuku Sibzamini (Potato Patties)' },
        { id: 8, title: 'Ash Reshteh (Persian Noodle Soup)' },
        { id: 9, title: 'Soup Jo (Creamy Barley Soup)' },
        { id: 10, title: 'Kotlet (Persian Meat Patties)' },
        { id: 11, title: 'Sabzi Khordan (Fresh Herb Platter)' },
        { id: 12, title: 'Torshi Liteh (Mixed Pickled Vegetables)' },
        { id: 13, title: 'Sir Torshi (Aged Garlic Pickle)' },
        { id: 14, title: 'Borani Esfenaj (Spinach Yogurt Dip)' },
        { id: 15, title: 'Dolmeh Barg Mo (Stuffed Grape Leaves)' },
        { id: 16, title: 'Zeytoon Parvardeh (Marinated Olives)' },
        { id: 17, title: 'Nargesi (Persian Spinach & Eggs)' }
    ];

    console.log(`🎯 Found ${targets.length} targets to restore.`);

    for (const target of targets) {
        console.log(`\n-----------------------------------`);
        console.log(`🔨 Processing Legacy ID ${target.id}: "${target.title}"`);

        // A. Insert Recipe (Legacy Integer ID)
        const { data: newRow, error: insertErr } = await supabase.from('recipes')
            .insert({
                name: target.title,
                name_en: target.title,
                category: 'Restored Legacy',
                ingredients: [],
                instructions: []
            })
            .select('id')
            .maybeSingle();

        if (insertErr) {
            console.error(`   ❌ Failed to insert DB row:`, insertErr.message);
            continue;
        }

        const legacyId = newRow.id;
        console.log(`   ✅ DB Row ensured (Legacy ID: ${legacyId}).`);

        // B. Ensure Registry with BRIDGE UUID
        // We create a fresh UUID for the "Modern" identity of this recipe
        const bridgeId = crypto.randomUUID();

        const { error: regErr } = await supabase.from('registry_recipes').upsert({
            legacy_recipe_id: legacyId,
            id: bridgeId // The UUID that content_translations will link to
        }, { onConflict: 'legacy_recipe_id' });

        if (regErr) {
            console.error(`   ⚠️ Registry Registry error:`, regErr.message);
        } else {
            console.log(`   ✅ Registry Mapped (Legacy ${legacyId} -> UUID ${bridgeId}).`);
        }

        // C. Ensure Pipeline State
        const { error: pipeErr } = await supabase.from('recipe_pipeline_state').upsert({
            legacy_recipe_id: target.id, // Pipeline tracks by legacy ID usually
            status: 'manual_retry',
            last_run: null
        }, { onConflict: 'legacy_recipe_id' });

        if (pipeErr) {
            console.error(`   ⚠️ Pipeline State error:`, pipeErr.message);
        } else {
            console.log(`   ✅ Pipeline armed for Legacy ID ${target.id}.`);
        }

        // D. Trigger Generation API
        console.log(`   ⚡ Triggering AI Generation...`);
        try {
            const res = await fetch(`${API_URL}?secret=${SECRET}&lang=en`);
            const json = await res.json();

            if (json.summary && json.summary.details) {
                // The API usually returns the Legacy ID in details if that's what it tracks
                const processed = json.summary.details.find(d => d.id == target.id); // Loose equality
                if (processed) {
                    console.log(`   🎉 SUCCESS! Generated: "${processed.title}"`);
                } else {
                    console.log(`   ⚠️ API Request sent.`);
                }
            }
        } catch (e) {
            console.error(`   ❌ API Call Failed:`, e.message);
        }
    }

    console.log("\n✅ Phase 2 Script Finished.");
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

generateMissing17();
