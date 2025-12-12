'use client'

import { useState } from 'react'
import { toggleItem, deleteItem, clearCompleted } from '../actions/shopping'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Archive } from 'lucide-react'
import { cn } from "@/lib/utils"

export default function ShoppingListClient({ initialItems }) {
    const [items, setItems] = useState(initialItems)

    async function handleToggle(id, checked) {
        // Optimistic update
        setItems(items.map(i => i.id === id ? { ...i, is_checked: checked } : i))
        await toggleItem(id, checked)
    }

    async function handleDelete(id) {
        setItems(items.filter(i => i.id !== id))
        await deleteItem(id)
    }

    async function handleClearCompleted() {
        setItems(items.filter(i => !i.is_checked))
        await clearCompleted()
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                <ShoppingCartIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg mb-4">لیست خرید شما خالی است</p>
                <a href="/" className="text-amber-600 hover:underline">بازگشت به دستور پخت‌ها</a>
            </div>
        )
    }

    // Group by Recipe
    const grouped = items.reduce((acc, item) => {
        const recipeName = item.recipes?.name || 'سایر';
        if (!acc[recipeName]) acc[recipeName] = [];
        acc[recipeName].push(item);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleClearCompleted} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Archive className="mr-2 h-4 w-4" />
                    پاک کردن انجام شده‌ها
                </Button>
            </div>

            {Object.entries(grouped).map(([recipeName, recipeItems]) => (
                <div key={recipeName} className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="bg-muted/50 px-4 py-3 border-b">
                        <h3 className="font-semibold text-lg">{recipeName}</h3>
                    </div>
                    <div className="divide-y">
                        {recipeItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 group hover:bg-muted/20 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <Checkbox
                                        id={`item-${item.id}`}
                                        checked={item.is_checked}
                                        onCheckedChange={(checked) => handleToggle(item.id, checked)}
                                        className="h-5 w-5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <label
                                        htmlFor={`item-${item.id}`}
                                        className={cn(
                                            "lex-1 text-base cursor-pointer select-none transition-all mr-3",
                                            item.is_checked && "text-muted-foreground line-through decoration-green-600/50"
                                        )}
                                    >
                                        {item.ingredient}
                                    </label>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(item.id)}
                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

function ShoppingCartIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
    )
}
