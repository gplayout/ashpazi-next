
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

// Parse helper
function parseEnv(key) {
    let val = process.env[key];
    if (!val) {
        // Fallback checks
        const viteKey = 'VITE_' + key;
        val = process.env[viteKey];
        if (!val) val = process.env['NEXT_PUBLIC_' + key];
    }
    return val;
}

const SUPABASE_URL = parseEnv('SUPABASE_URL');
const SUPABASE_KEY = parseEnv('SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase keys. Check .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function backup() {
    console.log('📦 Starting Database Backup...');

    let allRecipes = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error('❌ Backup Failed:', error);
            process.exit(1);
        }

        if (data.length > 0) {
            allRecipes = [...allRecipes, ...data];
            console.log(`   Fetched ${data.length} rows (Total: ${allRecipes.length})...`);
            page++;
        } else {
            hasMore = false;
        }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_recipes_${timestamp}.json`;
    const outputPath = path.resolve(__dirname, '../backups', filename);

    // Ensure directory
    const backupDir = path.dirname(outputPath);
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(allRecipes, null, 2));
    console.log(`✅ Backup Complete! Saved to: ${outputPath}`);
    console.log(`   Total Records: ${allRecipes.length}`);
}

backup();
