import { searchImages, SafeSearchType } from 'duck-duck-scrape';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        console.log(`🔍 [Curator] Searching for: ${query}`);

        // Search for images using DuckDuckGo (strictness off to get more matches)
        const results = await searchImages(query, {
            safeSearch: 0, // 0 = Strictness OFF (bypasses Enum import issues)
            // f: "size:medium,layout:wide", // Removed: not in ImageSearchOptions type
        });

        // Map to a clean format
        const candidates = results.results.slice(0, 15).map(result => ({
            title: result.title,
            image: result.image,
            thumbnail: result.thumbnail,
            source: result.url, // Original page URL
            domain: new URL(result.url).hostname.replace('www.', ''),
        }));

        return NextResponse.json({ candidates });
    } catch (error: unknown) {
        console.error('❌ [Curator] Search failed:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
