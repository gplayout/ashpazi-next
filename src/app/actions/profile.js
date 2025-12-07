'use server'

import { createClient } from '@/utils/supabase/server'

export async function getSavedRecipes() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data, error } = await supabase
        .from('saved_recipes')
        .select(`
      recipe_id,
      recipes (
        *
      )
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching saved recipes:', error)
        return []
    }

    // Flatten structure: data is [{ recipe_id: 1, recipes: { ... } }]
    // We want array of recipes
    return data.map(item => item.recipes).filter(Boolean)
}
