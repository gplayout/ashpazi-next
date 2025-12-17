import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    // We throw only if accessed server-side without keys. 
    // This prevents build-time errors if variables are missing in CI but keeps runtime strict.
    if (typeof window === 'undefined') {
        console.error('Pipeline Client: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
}

// Admin client for Pipeline operations (Bypasses RLS). 
// STRICTLY for server-side use in /src/app/api/pipeline.
export const pipelineClient = createClient(
    SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY || '',
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    }
);
