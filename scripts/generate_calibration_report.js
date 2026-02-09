
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const geminiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const SAMPLE_SIZE = 3;

async function runCalibration() {
    console.log(`⏱️ CALIBRATING SPEED (Sample: ${SAMPLE_SIZE} items)...`);

    // Fetch 1 source recipe for testing
    const { data: source } = await supabase
        .from('recipes')
        .select('name_en, ingredients_en, instructions_en')
        .limit(1)
        .single();

    if (!source) { console.error("No source recipe"); process.exit(1); }

    const timings = [];

    for (let i = 0; i < SAMPLE_SIZE; i++) {
        const start = Date.now();

        // Simulate prompt generation (Chef Zaffaron style)
        const prompt = `Translate to Turkish (Test). Title: ${source.name_en}. Return JSON.`;
        const result = await model.generateContent(prompt);
        await result.response; // Wait for full response

        // Simulate DB write (dummy update to avoid corruption in calibration)
        // We just do a select to mimic network roundtrip
        await supabase.from('content_translations_compiled').select('id').limit(1);

        const duration = Date.now() - start;
        timings.push(duration);
        console.log(`   Run ${i + 1}: ${duration}ms`);
    }

    const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
    const totalItems = 1547 * 12; // ~18,500
    const totalHours = (totalItems * avg) / 1000 / 3600;

    // Assuming x5 Concurrency
    const concurrentHours = totalHours / 5;

    console.log("\n--- TIMELINE REPORT ---");
    console.log(`Avg per Item: ${(avg / 1000).toFixed(2)}s`);
    console.log(`Total Sequential: ${totalHours.toFixed(1)} hours`);
    console.log(`Est. Concurrent (x5): ${concurrentHours.toFixed(1)} hours`);
    console.log(`Real-world Buffer (+30%): ${(concurrentHours * 1.3).toFixed(1)} hours`);
}

runCalibration();
