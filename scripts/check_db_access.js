
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
    console.log('✅ DATABASE_URL found:', dbUrl.substring(0, 15) + '...');
} else {
    console.log('❌ No DATABASE_URL found.');
}
