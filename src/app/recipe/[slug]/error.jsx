'use client';

import { useEffect } from 'react';
import { ChefHat, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function RecipeError({ error, reset }) {
    useEffect(() => {
        console.error('Recipe page error:', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <ChefHat className="w-8 h-8 text-amber-600" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Recipe failed to load</h2>
                    <p className="text-muted-foreground text-sm">
                        We couldn&apos;t load this recipe. It may be temporarily unavailable.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Browse recipes
                    </Link>
                </div>
            </div>
        </div>
    );
}
