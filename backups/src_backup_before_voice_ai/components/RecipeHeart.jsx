'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function RecipeHeart({ recipeId, initialIsSaved }) {
    const [isSaved, setIsSaved] = useState(initialIsSaved || false)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const checkSaved = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('saved_recipes')
                .select('*')
                .eq('user_id', user.id)
                .eq('recipe_id', recipeId)
                .single()

            if (data) setIsSaved(true)
        }
        checkSaved()
    }, [recipeId, supabase])

    const toggleSave = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            window.location.href = '/login'
            return
        }

        if (isSaved) {
            await supabase
                .from('saved_recipes')
                .delete()
                .eq('user_id', user.id)
                .eq('recipe_id', recipeId)
            setIsSaved(false)
        } else {
            await supabase
                .from('saved_recipes')
                .insert([{ user_id: user.id, recipe_id: recipeId }])
            setIsSaved(true)
        }
        setLoading(false)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-red-50 hover:text-red-600 h-8 w-8 transition-colors"
            onClick={toggleSave}
            disabled={loading}
        >
            <Heart
                className={cn("h-5 w-5 transition-all text-muted-foreground", isSaved && "fill-red-500 text-red-500 scale-110")}
            />
        </Button>
    )
}
