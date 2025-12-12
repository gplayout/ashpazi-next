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
        const q = searchParams.get('q') || '';
        const difficulty = searchParams.get('difficulty');
        const timeIndex = searchParams.get('time');
        const category = searchParams.get('category');

        let query = supabase
            .from('recipes')
            .select('*, recipe_translations(*)')
            .order('created_at', { ascending: false })
            .limit(50);

        // Text search - simple ilike on name only (most reliable)
        if (q && q.length >= 2) {
            query = query.ilike('name', `%${q}%`);
        }

        // Difficulty filter
        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }

        // Time filter
        if (timeIndex !== null && timeIndex !== undefined && timeIndex !== '') {
            const range = TIME_RANGES[parseInt(timeIndex)];
            if (range) {
                if (range.max && !range.min) {
                    query = query.lte('prep_time_minutes', range.max);
                } else if (range.min && !range.max) {
                    query = query.gte('prep_time_minutes', range.min);
                } else if (range.min && range.max) {
                    query = query.gte('prep_time_minutes', range.min).lte('prep_time_minutes', range.max);
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
            return NextResponse.json({ recipes: [], error: error.message }, { status: 200 });
        }

        return NextResponse.json({ recipes: data || [] });

    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ recipes: [], error: error.message }, { status: 200 });
    }
}

