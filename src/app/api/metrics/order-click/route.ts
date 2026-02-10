import { type NextRequest, NextResponse } from 'next/server';
import { pipelineClient } from '@/lib/pipeline-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slug, channel, sku } = body;

        // Fire-and-forget insertion (Don't await to keep UI snappy)
        // We use pipelineClient because it has Service Role access (bypasses RLS)
        const { error } = await pipelineClient.from('analytics_events').insert({
            event_type: 'conversion_click',
            channel: channel || 'unknown',
            entity_id: slug || 'unknown',
            metadata: {
                sku: sku,
                user_agent: request.headers.get('user-agent'),
                referer: request.headers.get('referer'),
            },
        });

        if (error) {
            console.error('Analytics Insert Error:', error);
        } else {
            console.log(`Analytics logged: ${channel} click for ${slug}`);
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Logging API Error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
