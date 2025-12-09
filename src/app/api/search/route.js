import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const TIME_RANGES = [
    { max: 30 },           // Quick
    { min: 30, max: 60 },  // Medium
    { min: 60 },           // Long
];

export async function GET(request) {
    try {
        // Lazy initialization
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q');
        const difficulty = searchParams.get('difficulty');
        const timeIndex = searchParams.get('time');
        const category = searchParams.get('category');

        let query = supabase
            .from('recipes')
            .select('*, recipe_translations(*)')
            .order('created_at', { ascending: false })
            .limit(50);

        // Text search
        if (q) {
            query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
        }

        // Difficulty filter
        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }

        // Time filter
        if (timeIndex !== null && timeIndex !== undefined) {
            const range = TIME_RANGES[parseInt(timeIndex)];
            if (range) {
                const totalTime = 'prep_time_minutes'; // Simplified: using prep time
                if (range.max && !range.min) {
                    query = query.lte(totalTime, range.max);
                } else if (range.min && !range.max) {
                    query = query.gte(totalTime, range.min);
                } else if (range.min && range.max) {
                    query = query.gte(totalTime, range.min).lte(totalTime, range.max);
                }
            }
        }

        // Category filter
        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Search error:', error);
            return NextResponse.json({ recipes: [], error: error.message }, { status: 500 });
        }

        return NextResponse.json({ recipes: data || [] });

    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ recipes: [], error: error.message }, { status: 500 });
    }
}
