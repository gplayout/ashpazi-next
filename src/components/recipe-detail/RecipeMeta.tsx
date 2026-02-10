'use client';
import React from 'react';

import { Flame, Clock, ChefHat, Activity, Dumbbell, Wheat, Droplet, Heart } from 'lucide-react';
import { getUiLabel } from '@/utils/dictionaries';
import { toPersianDigits } from '@/utils/farsi';

export default function RecipeMeta({
    recipe,
    nutritionData,
    language,
    displayName,
    displayCategory,
    displayPrepTime,
    displayCookTime,
    displayDifficulty,
    nutritionLoading,
}: {
    recipe: import('@/types').RecipeProps;
    nutritionData: Record<string, any>;
    language: string;
    displayName: string;
    displayCategory: string;
    displayPrepTime: string | number;
    displayCookTime: string | number;
    displayDifficulty: string;
    nutritionLoading: boolean;
}) {
    // Helper to format values for Persian/English
    const formatVal = (val: string | number | undefined, type?: string): string | number | null => {
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

    const category = nutritionData?.category || recipe.category || 'Main Dish';

    return (
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            {/* 🌟 Category Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm font-bold uppercase tracking-widest shadow-sm">
                <span className="text-lg">🍽️</span>
                {getUiLabel(category, language) || displayCategory}
            </div>

            {/* 👑 Royal Title */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black font-serif text-foreground leading-tight tracking-tight drop-shadow-sm">
                {displayName}
            </h1>

            {/* Rich Narrative (Centered) */}
            {(nutritionData?.marketing_description ||
                nutritionData?.description ||
                recipe.nutrition_info?.[language]?.description ||
                recipe.description) && (
                <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-light italic max-w-2xl mx-auto">
                    "
                    {nutritionData?.marketing_description ||
                        nutritionData?.description ||
                        recipe.nutrition_info?.[language]?.description ||
                        recipe.description}
                    "
                </p>
            )}

            {/* 📊 Meta Stats Row (Minimal & Clean) */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-4 pt-6 border-t border-border/40 w-full">
                {/* Prep */}
                <div className="flex flex-col items-center gap-1 group">
                    <span className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <Clock size={20} />
                    </span>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                            {getUiLabel('prep_time', language)}
                        </span>
                        <span className="font-bold text-sm md:text-base">
                            {displayPrepTime} {getUiLabel('minutes', language)}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-10 bg-border hidden md:block" />

                {/* Cook */}
                <div className="flex flex-col items-center gap-1 group">
                    <span className="p-2 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                        <Flame size={20} />
                    </span>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                            {getUiLabel('cook_time', language)}
                        </span>
                        <span className="font-bold text-sm md:text-base">
                            {displayCookTime} {getUiLabel('minutes', language)}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-10 bg-border hidden md:block" />

                {/* Difficulty */}
                <div className="flex flex-col items-center gap-1 group">
                    <span className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                        <ChefHat size={20} />
                    </span>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                            Level
                        </span>
                        <span className="font-bold text-sm md:text-base">{displayDifficulty}</span>
                    </div>
                </div>
            </div>

            {/* Scientific Macros */}
            {nutritionLoading ? (
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg animate-pulse">
                    <Activity size={18} className="text-muted-foreground" />
                    <span className="text-xs">{getUiLabel('analyzing', language)}</span>
                </div>
            ) : nutritionData?.calories ? (
                (() => {
                    return (
                        <>
                            <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 px-3 py-2 rounded-lg border border-teal-100 dark:border-teal-800 text-teal-800 dark:text-teal-200">
                                <Activity size={14} className="text-teal-600 dark:text-teal-400" />
                                <span className="font-bold text-sm tracking-wide">
                                    {formatVal(nutritionData.calories, 'kcal')}
                                </span>
                            </div>
                            {nutritionData.macros?.protein && (
                                <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200">
                                    <Dumbbell
                                        size={14}
                                        className="text-indigo-600 dark:text-indigo-400"
                                    />
                                    <span className="font-bold text-sm tracking-wide">
                                        {getUiLabel('protein', language)}:{' '}
                                        {formatVal(nutritionData.macros.protein)}
                                    </span>
                                </div>
                            )}
                            {nutritionData.macros?.carbs && (
                                <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-200">
                                    <Wheat size={14} className="text-blue-600 dark:text-blue-400" />
                                    <span className="font-bold text-sm tracking-wide">
                                        {getUiLabel('carbs', language)}:{' '}
                                        {formatVal(nutritionData.macros.carbs)}
                                    </span>
                                </div>
                            )}
                            {nutritionData.macros?.fat && (
                                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                    <Droplet
                                        size={14}
                                        className="text-slate-500 dark:text-slate-400"
                                    />
                                    <span className="font-bold text-sm tracking-wide">
                                        {getUiLabel('fat', language)}:{' '}
                                        {formatVal(nutritionData.macros.fat)}
                                    </span>
                                </div>
                            )}
                        </>
                    );
                })()
            ) : null}

            {/* Health Benefits (Scientific Look) */}
            {nutritionData?.health_benefits && nutritionData.health_benefits.length > 0 && (
                <div className="w-full flex flex-col items-center mt-6 p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
                    <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Heart size={12} className="fill-emerald-600 dark:fill-emerald-500" />
                        {getUiLabel('health_benefits', language)}
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2">
                        {nutritionData.health_benefits.map((benefit: string, idx: number) => (
                            <span
                                key={idx}
                                className="px-3 py-1.5 rounded-lg bg-white dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-medium shadow-sm"
                            >
                                {benefit}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
