'use client';

export default function DebugPage() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return (
        <div className="p-10 font-mono">
            <h1 className="text-xl font-bold mb-4">Environment Debug</h1>
            <p>Supabase URL: {url ? `${url.slice(0, 10)}...` : 'UNDEFINED'}</p>
            <p>Supabase Key: {anon ? 'PRESENT' : 'UNDEFINED'}</p>

            <div className="mt-4 p-4 bg-gray-100 rounded">
                <p>Process Env Keys available:</p>
                <pre>{JSON.stringify(Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')), null, 2)}</pre>
            </div>
        </div>
    );
}
