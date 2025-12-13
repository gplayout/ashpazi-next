'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { toPersianDigits, difficultyMap, categoryMap } from '@/utils/farsi';
import { Flame, ArrowLeft, Share2, Heart, Clock, ChefHat, Play, User, Activity, Dumbbell, Wheat, Droplet } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { getUiLabel } from '@/utils/dictionaries';
import { useNutrition } from '@/hooks/useNutrition';

// Components
import CookingMode from './CookingMode';
import StepTimer from './StepTimer';
import ChefAssistant from './ChefAssistant';
import NutritionAI from './NutritionAI';

export default function RecipeDetailClient({ recipe }) {
    const { language, t } = useLanguage();
    const [isCookingMode, setIsCookingMode] = useState(false);
    const { nutritionData, loading: nutritionLoading } = useNutrition(recipe);

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

            {/* Chef AI Assistant (Voice) */}
            <div className="relative z-[60]">
                <ChefAssistant recipeContext={recipe} />
            </div>

            {/* Hero / Header */}
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


            </div>

            {/* NEW Info Section (Below Hero) */}
            <div
                className="container mx-auto px-4 md:px-6 mt-8 mb-12"
                dir={language === 'fa' ? 'rtl' : 'ltr'}
            >
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-start">
                        <Badge className="mb-4 text-base px-3 py-1 bg-primary text-primary-foreground border-none w-fit">
                            {displayCategory}
                        </Badge>
                        <h1 className="text-3xl md:text-6xl font-black text-foreground leading-tight mb-4">
                            {displayName}
                        </h1>

                        {/* Intro / Description */}
                        {(recipe.nutrition_info?.[language]?.description || recipe.description) && (
                            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl leading-relaxed font-medium">
                                {recipe.nutrition_info?.[language]?.description || recipe.description}
                            </p>
                        )}
                    </div>

                    {/* Meta Stats & Macros Row */}
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Basic Stats */}
                        <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl border border-border/50">
                            <Clock size={18} className="text-primary" />
                            <span>{getUiLabel('prep_time', language)} {displayPrepTime} {getUiLabel('minutes', language)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl border border-border/50">
                            <Flame size={18} className="text-orange-500" />
                            <span>{getUiLabel('cook_time', language)} {displayCookTime} {getUiLabel('minutes', language)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl border border-border/50">
                            <ChefHat size={18} className="text-purple-500" />
                            <span>{displayDifficulty}</span>
                        </div>

                        {/* Macros */}
                        {nutritionLoading ? (
                            <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-xl animate-pulse">
                                <Activity size={18} className="text-muted-foreground" />
                                <span className="text-xs">{getUiLabel('analyzing', language)}</span>
                            </div>
                        ) : nutritionData?.calories ? (() => {
                            const formatVal = (val, type) => {
                                if (!val) return null;
                                if (language !== 'fa') {
                                    if (type === 'kcal') return `${val} kcal`;
                                    return val;
                                }
                                let str = val.toString();
                                str = str.replace(/[0-9]/g, d => toPersianDigits(d));
                                str = str.replace(/g/i, ' گرم');
                                str = str.replace(/kcal/i, ' کیلوکالری');
                                if (type === 'kcal') return `${str} کیلوکالری`;
                                return str;
                            };

                            return (
                                <>
                                    <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/20 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                                        <Activity size={14} className="text-emerald-500" />
                                        <span className="font-bold text-sm">{formatVal(nutritionData.calories, 'kcal')}</span>
                                    </div>
                                    {nutritionData.macros?.protein && (
                                        <div className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/20 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                                            <Dumbbell size={14} className="text-blue-500" />
                                            <span className="font-bold text-sm">{getUiLabel('protein', language)}: {formatVal(nutritionData.macros.protein)}</span>
                                        </div>
                                    )}
                                    {nutritionData.macros?.carbs && (
                                        <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/20 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                                            <Wheat size={14} className="text-amber-500" />
                                            <span className="font-bold text-sm">{getUiLabel('carbs', language)}: {formatVal(nutritionData.macros.carbs)}</span>
                                        </div>
                                    )}
                                    {nutritionData.macros?.fat && (
                                        <div className="flex items-center gap-1.5 bg-rose-100 dark:bg-rose-900/20 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                                            <Droplet size={14} className="text-rose-500" />
                                            <span className="font-bold text-sm">{getUiLabel('fat', language)}: {formatVal(nutritionData.macros.fat)}</span>
                                        </div>
                                    )}
                                </>
                            );
                        })() : null}
                    </div>

                    {/* Chef Insight + Health */}
                    <div className="flex flex-col gap-4 mt-2">
                        {nutritionData?.chef_insight && (
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 max-w-3xl">
                                <div className="flex items-start gap-3">
                                    <ChefHat size={20} className="text-amber-600 mt-1 shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-1">{language === 'fa' ? 'نظر سرآشپز' : 'Chef\'s Insight'}</h3>
                                        <p className="italic text-foreground/80 leading-relaxed">"{nutritionData.chef_insight}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {nutritionData?.health_benefits && nutritionData.health_benefits.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {nutritionData.health_benefits.map((benefit, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm font-medium">
                                        <Heart size={12} className="text-green-500 fill-green-500 shrink-0" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Layout */}
            <div className="container mx-auto px-4 md:px-6 mt-12 grid md:grid-cols-[1fr_2fr] gap-12">

                {/* Sidebar: Ingredients & Nutrition Details */}
                <aside className="space-y-8">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-8">
                        <div dir={language === 'fa' ? 'rtl' : 'ltr'}>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-primary">●</span> {getUiLabel('ingredients', language)}
                            </h2>
                            <ul className="space-y-3">
                                {displayIngredients && displayIngredients.length > 0 ? (
                                    displayIngredients.map((ing, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50">
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
                        </div>

                        {/* Action Button */}
                        <Button
                            onClick={() => setIsCookingMode(true)}
                            className="w-full mt-8 font-bold text-lg h-12 rounded-xl shadow-md border-b-4 border-primary/20 active:border-b-0 active:translate-y-1 transition-all"
                        >
                            {getUiLabel('start_cooking', language)}
                        </Button>
                    </div>

                    {/* Nutrition Card (Sidebar REMOVED as requested) */}
                    {/* <NutritionAI recipe={recipe} data={nutritionData} isLoading={nutritionLoading} /> */}
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
                                        <div className={`absolute top-0 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary font-bold flex items-center justify-center text-sm shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 ${language === 'fa' ? '-right-4' : '-left-4'}`}>
                                            {language === 'fa' ? toPersianDigits(idx + 1) : idx + 1}
                                        </div>
                                        <div className="bg-muted/30 p-6 rounded-2xl hover:bg-muted/60 transition-colors">
                                            <p className={`text-lg leading-relaxed text-foreground/90 ${language === 'fa' ? 'text-right' : 'text-left'}`}>
                                                {language === 'fa' ? toPersianDigits(step) : step}
                                            </p>
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
