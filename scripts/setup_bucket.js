import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
// Requires Service Role for bucket creation if RLS is strict, but usually Anon allows it if public.
// If this fails, user might need to create it in dashboard or provide service role key.

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket() {
    console.log("🪣 Setting up 'recipe-images' bucket...");

    const { data, error } = await supabase
        .storage
        .createBucket('recipe-images', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
        });

    if (error) {
        console.error("Error creating bucket:", error);
    } else {
        console.log("✅ Bucket created successfully:", data);
    }
}

setupBucket();
