'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getShoppingList() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('shopping_items')
        .select(`
      *,
      recipes (name, id)
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching shopping list:', error)
        return []
    }

    return data
}

export async function addToShoppingList(ingredients, recipeId) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Prepare items for insertion
    const items = ingredients.map(ing => ({
        user_id: user.id,
        ingredient: ing,
        recipe_id: recipeId
    }))

    const { error } = await supabase
        .from('shopping_items')
        .insert(items)

    if (error) {
        console.error('Error adding to shopping list:', error)
        return { error: error.message }
    }

    revalidatePath('/shopping-list')
    return { success: true }
}

export async function toggleItem(itemId, isChecked) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('shopping_items')
        .update({ is_checked: isChecked })
        .eq('id', itemId)

    if (error) throw error
    revalidatePath('/shopping-list')
}

export async function deleteItem(itemId) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', itemId)

    if (error) throw error
    revalidatePath('/shopping-list')
}

export async function clearCompleted() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('user_id', user.id)
        .eq('is_checked', true)

    if (error) throw error
    revalidatePath('/shopping-list')
}
