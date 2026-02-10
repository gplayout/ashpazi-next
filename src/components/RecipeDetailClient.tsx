'use client';
import React from 'react';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import { toPersianDigits } from '@/utils/farsi';
import { getUiLabel } from '@/utils/dictionaries';
import { Button } from '@/components/ui/button';

// Sub-components
import RecipeHero from './recipe-detail/RecipeHero';
import RecipeMeta from './recipe-detail/RecipeMeta';
import RecipeIngredients from './recipe-detail/RecipeIngredients';
import RecipeInstructions from './recipe-detail/RecipeInstructions';
import RecipeBento from './recipe-detail/RecipeBento';

// Feature Components
import CookingMode from './CookingMode';
import ChefAssistant from './ChefAssistant';
import SocialShareModal from './SocialShareModal';
import ChefCTA from './ChefCTA';

export default function RecipeDetailClient({
    recipe,
    initialLang,
}: {
    recipe: import('@/types').RecipeProps;
    initialLang?: string;
}) {
    const { language: contextLang, setLanguage, t } = useLanguage();

    // Zero-Flash Logic
    const validLangs = [
        'en',
        'fa',
        'de',
        'fr',
        'es',
        'ar',
        'zh',
        'ja',
        'it',
        'pt',
        'tr',
        'hi',
        'ko',
    ];
    const language = initialLang && validLangs.includes(initialLang) ? initialLang : contextLang;

    // Sync URL lang with Context
    useEffect(() => {
        if (initialLang && validLangs.includes(initialLang) && contextLang !== initialLang) {
            setLanguage(initialLang);
        }
    }, [initialLang, contextLang, setLanguage]);

    const [isCookingMode, setIsCookingMode] = useState<boolean>(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

    if (!recipe) return null;

    // Simple Display Logic (DTO is Source of Truth)
    const displayPrepTime =
        language === 'fa' ? toPersianDigits(recipe.prep_time_minutes) : recipe.prep_time_minutes;
    const displayCookTime =
        language === 'fa' ? toPersianDigits(recipe.cook_time_minutes) : recipe.cook_time_minutes;
    const difficulty = recipe.difficulty || 'Medium';
    const displayDifficulty = getUiLabel(difficulty, language);
    const category = recipe.category || 'Main Dish'; // DTO doesn't pass category specifically in mapping yet, defaulting.
    const displayCategory = getUiLabel(category, language);

    // Direct Prop Usage
    const displayName = recipe.name;
    const displayIngredients = recipe.ingredients || [];
    const displayInstructions = recipe.instructions || [];

    // Construct a minimal nutrition object for Bento if needed (or pass null)
    // For now, we pass null/empty to disable Bento if no data, or a stub if we want to show it.
    // The previous code passed `nutritionData`.
    const nutritionData = recipe.nutrition_info?.[language] || recipe.nutrition_info?.en || {};

    return (
        <article className="min-h-screen bg-background pb-20">
            {/* Cooking Mode Overlay */}
            {isCookingMode && (
                <CookingMode recipe={recipe} onClose={() => setIsCookingMode(false)} />
            )}

            {/* Chef AI Assistant (Voice) */}
            <div className="relative z-[60]">
                <ChefAssistant recipeContext={recipe} />
            </div>

            {/* Hero Image */}
            <RecipeHero
                recipe={recipe}
                displayName={displayName}
                onShare={() => setIsShareModalOpen(true)}
            />

            {/* Share Modal */}
            <SocialShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                recipe={recipe}
            />

            <div
                className="container mx-auto px-4 md:px-6 mt-8 mb-12"
                dir={['fa', 'ar'].includes(language) ? 'rtl' : 'ltr'}
            >
                <div className="flex flex-col gap-6">
                    {/* Title, Times, Macros */}
                    <RecipeMeta
                        recipe={recipe}
                        nutritionData={nutritionData}
                        language={language}
                        displayName={displayName}
                        displayCategory={displayCategory}
                        displayPrepTime={displayPrepTime}
                        displayCookTime={displayCookTime}
                        displayDifficulty={displayDifficulty}
                        nutritionLoading={false}
                    />

                    {/* Bento Grid (Rich Visuals) */}
                    <RecipeBento nutritionData={nutritionData} language={language} />

                    {/* Transactional CTA */}
                    <div className="max-w-md mx-auto w-full">
                        <ChefCTA recipeId={recipe.id} recipeName={displayName} />
                    </div>

                    <div className="max-w-md mx-auto w-full">
                        <Button
                            onClick={() => setIsCookingMode(true)}
                            className="w-full font-bold text-lg h-12 rounded-xl shadow-md border-b-4 border-primary/20 active:border-b-0 active:translate-y-1 transition-all"
                        >
                            {getUiLabel('start_cooking', language)}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content: Ingredients & Instructions */}
            <div className="container mx-auto px-4 md:px-6 mt-12 grid md:grid-cols-[1fr_2fr] gap-12">
                <RecipeIngredients
                    language={language}
                    displayIngredients={displayIngredients}
                    nutritionData={nutritionData}
                />

                <RecipeInstructions
                    language={language}
                    displayInstructions={displayInstructions}
                    recipe={recipe}
                />
            </div>
        </article>
    );
}
