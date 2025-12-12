'use client';

import { useState, useEffect, useRef } from 'react';
import RecipeCard from './RecipeCard';
import { fetchRecipes } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { toPersianDigits } from '@/utils/farsi';
import { getUiLabel } from '@/utils/dictionaries';

import RecipeCardSkeleton from './RecipeCardSkeleton';

export default function RecipeFeed({ initialRecipes }) {
    const { language } = useLanguage();
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
            <div className={`flex items-center justify-between mb-8 ${language === 'fa' ? 'flex-row-reverse' : ''}`}>
                <h2 className="text-2xl font-bold">{getUiLabel('latest_recipes', language)}</h2>
                <span className="text-sm text-muted-foreground">
                    {language === 'fa'
                        ? `${toPersianDigits(recipes.length)} ${getUiLabel('recipes_loaded', language)}`
                        : `${recipes.length} ${getUiLabel('recipes_loaded', language)}`}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
                {/* Show skeleton cards while loading */}
                {loading && [...Array(4)].map((_, i) => (
                    <RecipeCardSkeleton key={`skeleton-${i}`} />
                ))}
            </div>

            <div ref={observerTarget} className="w-full flex justify-center py-12">
                {hasMore && !loading && <div className="h-4" />}
                {!hasMore && (
                    <p className="text-muted-foreground text-sm">{getUiLabel('reached_end', language)}</p>
                )}
            </div>
        </>
    );
}
