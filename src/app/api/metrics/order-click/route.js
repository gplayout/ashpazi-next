import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { slug, channel, sku } = body;

        const logEntry = {
            event: "order_click",
            slug: slug,
            channel: channel,
            sku: sku,
            ts: new Date().toISOString(),
            ua: request.headers.get('user-agent') || 'unknown'
        };

        // Standardized Log for Grep/Monitoring
        console.log(JSON.stringify(logEntry));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logging API Error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
