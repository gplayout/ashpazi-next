'use client';

import { useState, useEffect, useRef } from 'react';
import RecipeCard from './RecipeCard';
import { fetchRecipes } from '@/app/actions';
import { Loader2 } from 'lucide-react';

export default function RecipeFeed({ initialRecipes }) {
    const [recipes, setRecipes] = useState(initialRecipes);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading]);

    const loadMore = async () => {
        setLoading(true);
        const nextPage = page + 1;
        const newRecipes = await fetchRecipes(nextPage, 24);

        if (newRecipes.length === 0) {
            setHasMore(false);
        } else {
            // Deduplicate logic
            setRecipes(prev => {
                const existingIds = new Set(prev.map(r => r.id));
                const uniqueNewRecipes = newRecipes.filter(r => !existingIds.has(r.id));
                return [...prev, ...uniqueNewRecipes];
            });
            setPage(nextPage);
        }
        setLoading(false);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Latest Recipes</h2>
                <span className="text-sm text-muted-foreground">{recipes.length} recipes loaded</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </div>

            <div ref={observerTarget} className="w-full flex justify-center py-12">
                {hasMore && (
                    loading ? <Loader2 className="animate-spin text-saffron-600 w-8 h-8" /> : <div className="h-4" />
                )}
                {!hasMore && (
                    <p className="text-muted-foreground text-sm">You've reached the end!</p>
                )}
            </div>
        </>
    );
}
