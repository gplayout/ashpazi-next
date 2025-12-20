
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log("Loaded Keys:", Object.keys(process.env).filter(k => !k.startsWith('Program') && !k.startsWith('System')));
