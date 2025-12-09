
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

function parseEnv(key) {
    let val = process.env[key];
    if (!val) {
        val = process.env['VITE_' + key] || process.env['NEXT_PUBLIC_' + key];
    }
    return val;
}

const SUPABASE_URL = parseEnv('SUPABASE_URL');
const SUPABASE_KEY = parseEnv('SUPABASE_ANON_KEY'); // Should Ideally be SERVICE_ROLE, but let's try ANON.
// Note: If RLS prevents insert, this will fail.
// Users usually provide ANON key.
// But we added "auth.role() = 'anon'" to the policy in Step 1, so it should work!

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Keys');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
    console.log('🚀 Starting Data Migration...');

    // Fetch all recipes
    let { count } = await supabase.from('recipes').select('*', { count: 'exact', head: true });
    console.log(`Found ${count} recipes.`);

    let page = 0;
    const pageSize = 50; // Batch size
    let hasMore = true;
    let totalMigrated = 0;

    while (hasMore) {
        const { data: recipes, error } = await supabase
            .from('recipes')
            .select('*')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error('Fetch Error:', error);
            break;
        }

        if (recipes.length === 0) {
            hasMore = false;
            break;
        }

        // Prepare translations
        const translations = [];
        for (const r of recipes) {
            // Farsi
            translations.push({
                recipe_id: r.id,
                language: 'fa',
                title: r.name,
                description: r.description, // Wait, existing description might be Farsi? Yes.
                ingredients: r.ingredients || [],
                instructions: r.instructions || []
            });

            // English (Only if name_en exists)
            if (r.name_en) {
                translations.push({
                    recipe_id: r.id,
                    language: 'en',
                    title: r.name_en,
                    description: r.description_en || null, // Assuming description_en exists? Probably not yet populated well?
                    // actually chef_editor populated ingredients_en/instructions_en
                    ingredients: r.ingredients_en || [],
                    instructions: r.instructions_en || []
                });
            }
        }

        if (translations.length > 0) {
            const { error: insertError } = await supabase
                .from('recipe_translations')
                .upsert(translations, { onConflict: 'recipe_id, language' });

            if (insertError) {
                console.error('❌ Insert Error:', insertError);
            } else {
                totalMigrated += translations.length;
                console.log(`   ✅ Batch ${page + 1}: Migrated ${translations.length} records.`);
            }
        }

        page++;
    }

    console.log(`🎉 Migration Complete! Total Translations: ${totalMigrated}`);
}

migrate();
