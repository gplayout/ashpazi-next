'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { addToShoppingList } from '@/app/actions/shopping'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function RecipeShoppingBtn({ recipeId, ingredients }) {
    const [added, setAdded] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleAdd = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        setLoading(true)

        // Parse ingredients if string (legacy) or use array
        let items = []
        if (Array.isArray(ingredients)) {
            items = ingredients
        } else if (typeof ingredients === 'string') {
            // Basic fallback split by newline if string
            items = ingredients.split('\n').filter(i => i.trim().length > 0)
        }

        if (items.length === 0) {
            // Fallback if no ingredients found, maybe just add recipe name?
            items = [`Ingredients for Recipe #${recipeId}`]
        }

        await addToShoppingList(items, recipeId)

        setAdded(true)
        setLoading(false)

        // Reset checkmark after 2 seconds
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "rounded-full h-8 w-8 transition-colors",
                added ? "bg-green-100 text-green-600 hover:bg-green-200" : "hover:bg-amber-50 hover:text-amber-600"
            )}
            onClick={handleAdd}
            disabled={loading}
            title="Add ingredients to Shopping List"
        >
            {added ? (
                <Check className="h-4 w-4" />
            ) : (
                <ShoppingCart className="h-4 w-4" />
            )}
        </Button>
    )
}
