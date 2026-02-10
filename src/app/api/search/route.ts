import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const TIME_RANGES = [
    { max: 30 }, // Quick
    { min: 30, max: 60 }, // Medium
    { min: 60 }, // Long
];

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') || '';
        const difficulty = searchParams.get('difficulty');
        const timeIndex = searchParams.get('time');
        const category = searchParams.get('category');

        let query = supabase
            .from('recipes')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        // Smart Search Logic
        if (q && q.length >= 2) {
            const isFarsi = /[\u0600-\u06FF]/.test(q);
            const terms = q.split(/\s+/).filter(t => t.length > 1); // Split "Chicken Rice"

            // Construct Filter for EACH term (Implied AND)
            // We want recipes that contain "Chicken" AND "Rice"
            // For each term, it can be in Title OR Ingredients

            terms.forEach(term => {
                const safeTerm = term.replace(/'/g, "''"); // SQL Injection Protection in JS? Supabase handles it, but just mostly for string formatting

                if (isFarsi) {
                    // Farsi: Search 'name' OR 'ingredients' (via ilike mostly safe)
                    // Note: ILIKE on array casts to text automatically in some Postgres versions, but let's try strict OR
                    // Using Supabase simplified syntax
                    query = query.or(
                        `name.ilike.%${safeTerm}%,ingredients.cs.{"${safeTerm}"},tags.cs.{"${safeTerm}"}`
                    );
                } else {
                    // English: Search 'name_en', 'name', 'ingredients_en'
                    // Also check translations title
                    query = query.or(
                        `name_en.ilike.%${safeTerm}%,name.ilike.%${safeTerm}%,ingredients_en.cs.{"${safeTerm}"},ingredients.cs.{"${safeTerm}"}`
                    );
                }
            });
        }

        // Difficulty filter
        if (difficulty) query = query.eq('difficulty', difficulty);

        // Category filter
        if (category) query = query.eq('category', category);

        // Time filter logic
        if (timeIndex !== null && timeIndex !== undefined && timeIndex !== '') {
            const range = TIME_RANGES[parseInt(timeIndex)];
            if (range) {
                if (range.max && !range.min) query = query.lte('prep_time_minutes', range.max);
                else if (range.min && !range.max) query = query.gte('prep_time_minutes', range.min);
                else if (range.min && range.max)
                    query = query
                        .gte('prep_time_minutes', range.min)
                        .lte('prep_time_minutes', range.max);
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error('Search error:', error);
            // Fallback: Return empty list rather than 500
            return NextResponse.json({ recipes: [] });
        }

        return NextResponse.json({ recipes: data || [] });
    } catch (error: unknown) {
        console.error('Search API Critical:', error);
        return NextResponse.json({
            recipes: [],
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
