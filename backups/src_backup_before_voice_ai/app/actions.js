'use server'

import { supabase } from '@/lib/supabase';

export async function fetchRecipes(page = 1, limit = 24) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('recipes')
        .select('*, recipe_translations(*)')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }

    return data;
}
