'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { toPersianDigits, difficultyMap, categoryMap } from '@/utils/farsi';
import { Clock, Flame, ChefHat, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Imports
import { getUiLabel } from '@/utils/dictionaries';
import CookingMode from './CookingMode';
import StepTimer from './StepTimer';
import { useState } from 'react';

export default function RecipeDetailClient({ recipe }) {
    const { language, t } = useLanguage();
    const [isCookingMode, setIsCookingMode] = useState(false);

    if (!recipe) return null;

    // Helper for display
    const prepTime = recipe.prep_time_minutes || 30;
    const cookTime = recipe.cook_time_minutes || 45;

    const displayPrepTime = language === 'fa' ? toPersianDigits(prepTime) : prepTime;
    const displayCookTime = language === 'fa' ? toPersianDigits(cookTime) : cookTime;

    const difficulty = recipe.difficulty || 'Medium';
    const displayDifficulty = getUiLabel(difficulty, language);

    const category = recipe.category || 'Persian Cuisine';
    const displayCategory = getUiLabel(category, language);

    // Localized fields
    const displayName = t(recipe, 'name');
    const displayIngredients = t(recipe, 'ingredients') || [];
    const displayInstructions = t(recipe, 'instructions') || [];

    // Helper to detect time in step
    const detectTime = (text) => {
        const timeRegex = language === 'fa'
            ? /(\d+)\s*(دقیقه)/
            : /(\d+)\s*(minute|min|minutes|mins)/i;
        const match = text.match(timeRegex);
        return match ? parseInt(match[1]) : null;
    };

    return (
        <article className="min-h-screen bg-background pb-20">
            {/* Cooking Mode Overlay */}
            {isCookingMode && (
                <CookingMode
                    recipe={recipe}
                    onClose={() => setIsCookingMode(false)}
                />
            )}

            {/* Hero / Header with Parallax-like Image */}
            <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
                {recipe.image ? (
                    <Image
                        src={recipe.image}
                        alt={displayName}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ChefHat size={80} className="text-muted-foreground/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                {/* Navigation Back */}
                <div className="absolute top-6 left-6 z-10">
                    <Link href="/">
                        <Button variant="secondary" size="icon" className="rounded-full shadow-lg backdrop-blur-md bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                </div>

                {/* Title Overlay */}
                <div className={`absolute bottom-0 w-full p-6 md:p-12 ${language === 'fa' ? 'right-0 text-right' : 'left-0 text-left'}`}>
                    <div className="container mx-auto">
                        <Badge className="mb-4 text-base px-3 py-1 bg-primary text-primary-foreground border-none">
                            {displayCategory}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black text-foreground drop-shadow-sm leading-tight mb-4">
                            {displayName}
                        </h1>

                        {/* Meta Stats */}
                        <div className={`flex flex-wrap gap-6 text-sm md:text-base font-medium text-foreground/80 ${language === 'fa' ? 'flex-row-reverse justify-end' : ''}`}>
                            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
                                <Clock size={18} className="text-primary" />
                                <span>{getUiLabel('prep_time', language)} {displayPrepTime} {getUiLabel('minutes', language)}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
                                <Flame size={18} className="text-orange-500" />
                                <span>{getUiLabel('cook_time', language)} {displayCookTime} {getUiLabel('minutes', language)}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
                                <ChefHat size={18} className="text-purple-500" />
                                <span>{displayDifficulty}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Layout */}
            <div className="container mx-auto px-4 md:px-6 mt-12 grid md:grid-cols-[1fr_2fr] gap-12">

                {/* Sidebar: Ingredients */}
                <aside className="space-y-8">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-8">
                        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${language === 'fa' ? 'flex-row-reverse' : ''}`}>
                            <span className="text-primary">●</span> {getUiLabel('ingredients', language)}
                        </h2>
                        <ul className="space-y-3">
                            {displayIngredients && displayIngredients.length > 0 ? (
                                displayIngredients.map((ing, idx) => (
                                    <li key={idx} className={`flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 ${language === 'fa' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                        <span className="leading-relaxed">{language === 'fa' ? toPersianDigits(ing) : ing}</span>
                                    </li>
                                ))
                            ) : (
                                <p className="text-muted-foreground italic text-center">
                                    {getUiLabel('ingredients_embedded', language)}
                                </p>
                            )}
                        </ul>

                        {/* Action Button */}
                        <Button
                            onClick={() => setIsCookingMode(true)}
                            className="w-full mt-8 font-bold text-lg h-12 rounded-xl shadow-md border-b-4 border-primary/20 active:border-b-0 active:translate-y-1 transition-all"
                        >
                            {getUiLabel('start_cooking', language)}
                        </Button>
                    </div>
                </aside>

                {/* Main: Instructions */}
                <section>
                    <h2 className={`text-3xl font-bold mb-8 pb-4 border-b border-border ${language === 'fa' ? 'text-right' : 'text-left'}`}>
                        {getUiLabel('instructions', language)}
                    </h2>
                    <div className="space-y-8">
                        {displayInstructions && displayInstructions.length > 0 ? (
                            displayInstructions.map((step, idx) => {
                                const detected = detectTime(step);
                                return (
                                    <div key={idx} className={`group relative pl-8 pb-8 border-l border-border last:border-0 last:pb-0 ${language === 'fa' ? 'border-r border-l-0 pr-8 pl-0' : ''}`}>
                                        {/* Step Number Bubble */}
                                        <div className={`absolute top-0 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary font-bold flex items-center justify-center text-sm shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 ${language === 'fa' ? '-right-4' : '-left-4'}`}>
                                            {language === 'fa' ? toPersianDigits(idx + 1) : idx + 1}
                                        </div>

                                        {/* Content */}
                                        <div className="bg-muted/30 p-6 rounded-2xl hover:bg-muted/60 transition-colors">
                                            <p className={`text-lg leading-relaxed text-foreground/90 ${language === 'fa' ? 'text-right' : 'text-left'}`}>
                                                {language === 'fa' ? toPersianDigits(step) : step}
                                            </p>

                                            {/* Inline Step Timer */}
                                            {detected && (
                                                <div className={`mt-4 ${language === 'fa' ? 'flex justify-end' : ''}`}>
                                                    <StepTimer duration={detected} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-lg text-muted-foreground text-center">
                                {recipe.original_text || getUiLabel('no_instructions', language)}
                            </p>
                        )}
                    </div>
                </section>

            </div>
        </article>
    );
}
