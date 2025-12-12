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

                {/* Title Overlay */}
                <div className={`absolute bottom-0 w-full p-6 md:p-12 ${language === 'fa' ? 'right-0 text-right' : 'left-0 text-left'}`}>
                    <div className="container mx-auto">
                        <Badge className="mb-4 text-base px-3 py-1 bg-primary text-primary-foreground border-none">
                            {displayCategory}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black text-foreground drop-shadow-sm leading-tight mb-4">
                            {displayName}
                        </h1>

                        {/* Meta Stats & Nutrition Pills */}
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

                            {/* Dynamic Nutrition Pills */}
                            {nutritionLoading ? (
                                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50 animate-pulse">
                                    <Activity size={18} className="text-muted-foreground" />
                                    <span className="text-muted-foreground text-xs">{getUiLabel('analyzing', language)}</span>
                                </div>
                            ) : nutritionData?.calories ? (() => {
                                // Helper to localizing values (e.g. "43g" -> "۴۳ گرم")
                                const formatVal = (val, type) => {
                                    if (!val) return null;
                                    if (language !== 'fa') {
                                        if (type === 'kcal') return `${val} kcal`;
                                        return val; // e.g. "43g"
                                    }
                                    // Farsi logic
                                    let str = val.toString();
                                    str = str.replace(/[0-9]/g, d => toPersianDigits(d));
                                    str = str.replace(/g/i, ' گرم');
                                    str = str.replace(/kcal/i, ' کیلوکالری');

                                    if (type === 'kcal') return `${str} کیلوکالری`;
                                    return str;
                                };

                                return (
                                    <>
                                        {/* Mobile Friendly Pills: Smaller padding/text */}
                                        <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-border/50 animate-in fade-in zoom-in text-emerald-700 dark:text-emerald-300">
                                            <Activity size={14} className="text-emerald-500 md:w-[18px] md:h-[18px]" />
                                            <span className="font-bold text-xs md:text-sm">{formatVal(nutritionData.calories, 'kcal')}</span>
                                        </div>
                                        {nutritionData.macros?.protein && (
                                            <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-border/50 animate-in fade-in zoom-in text-blue-700 dark:text-blue-300">
                                                <Dumbbell size={14} className="text-blue-500 md:w-[18px] md:h-[18px]" />
                                                <span className="font-bold text-xs md:text-sm">{getUiLabel('protein', language)}: {formatVal(nutritionData.macros.protein)}</span>
                                            </div>
                                        )}
                                        {nutritionData.macros?.carbs && (
                                            <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-border/50 animate-in fade-in zoom-in text-amber-700 dark:text-amber-300">
                                                <Wheat size={14} className="text-amber-500 md:w-[18px] md:h-[18px]" />
                                                <span className="font-bold text-xs md:text-sm">{getUiLabel('carbs', language)}: {formatVal(nutritionData.macros.carbs)}</span>
                                            </div>
                                        )}
                                        {nutritionData.macros?.fat && (
                                            <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-border/50 animate-in fade-in zoom-in text-rose-700 dark:text-rose-300">
                                                <Droplet size={14} className="text-rose-500 md:w-[18px] md:h-[18px]" />
                                                <span className="font-bold text-xs md:text-sm">{getUiLabel('fat', language)}: {formatVal(nutritionData.macros.fat)}</span>
                                            </div>
                                        )}
                                    </>
                                );
                            })() : null}
                        </div>

                        {/* Chef Insight Card (Hero Layout) */}
                        {nutritionData?.chef_insight && (
                            <div className="mt-6 p-4 rounded-xl bg-background/60 backdrop-blur-md border border-white/20 shadow-lg max-w-2xl animate-in slide-in-from-bottom-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-amber-100 p-1.5 rounded-full shrink-0">
                                        <ChefHat size={16} className="text-amber-600" />
                                    </div>
                                    <p className="text-sm md:text-base italic text-foreground/90 leading-relaxed">
                                        "{nutritionData.chef_insight}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Health Benefits (Restored) */}
                        {nutritionData?.health_benefits && nutritionData.health_benefits.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2 animate-in slide-in-from-bottom-6 duration-700">
                                {nutritionData.health_benefits.map((benefit, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 backdrop-blur-md border border-rose-500/20 text-rose-800 dark:text-rose-200 text-xs md:text-sm font-medium">
                                        <Heart size={12} className="text-rose-500 fill-rose-500" />
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
