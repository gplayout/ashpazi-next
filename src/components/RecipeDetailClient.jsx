'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { toPersianDigits, difficultyMap, categoryMap } from '@/utils/farsi';
import { Flame, ArrowLeft, Share2, Heart, Clock, ChefHat, Play, User, Activity, Dumbbell, Wheat, Droplet } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { getUiLabel } from '@/utils/dictionaries';
import { useNutrition } from '@/hooks/useNutrition';

// Components
import CookingMode from './CookingMode';
import StepTimer from './StepTimer';
import ChefAssistant from './ChefAssistant';
import NutritionAI from './NutritionAI';
import SocialShareModal from './SocialShareModal';
import ChefCTA from './ChefCTA';

export default function RecipeDetailClient({ recipe, initialLang }) {
    const { language: contextLang, setLanguage, t } = useLanguage();

    // Zero-Flash Logic: Use initialLang for rendering if valid, otherwise fallback to context
    const validLangs = ['en', 'fa', 'de', 'fr', 'es', 'ar', 'zh', 'ja'];
    const language = (initialLang && validLangs.includes(initialLang)) ? initialLang : contextLang;

    // Sync URL lang with Context
    // Sync URL lang with Context
    // Sync URL lang with Context (Eventual Consistency)
    useEffect(() => {
        if (initialLang && validLangs.includes(initialLang) && contextLang !== initialLang) {
            setLanguage(initialLang);
        }
    }, [initialLang, contextLang, setLanguage]);

    const [isCookingMode, setIsCookingMode] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Pass initialLang to useNutrition to avoid 'en' flash/race condition
    const { nutritionData, loading: nutritionLoading } = useNutrition(recipe, initialLang);

    if (!recipe) return null;

    // Helper for display
    const prepTime = recipe.prep_time_minutes || 30;
    const cookTime = recipe.cook_time_minutes || 45;

    const displayPrepTime = language === 'fa' ? toPersianDigits(prepTime) : prepTime;
    const displayCookTime = language === 'fa' ? toPersianDigits(cookTime) : cookTime;

    const difficulty = recipe.difficulty || 'Medium';
    const displayDifficulty = getUiLabel(difficulty, language);

    // RESTORED FALLBACK: DB is now scrubbed and contains safe English values (e.g. "Rice Dish")
    const category = nutritionData?.category || recipe.category || 'Main Dish';
    const displayCategory = getUiLabel(category, language);

    // Localized fields
    const displayName = nutritionData?.name || t(recipe, 'name');
    const displayIngredients = nutritionData?.ingredients || t(recipe, 'ingredients') || [];
    const displayInstructions = nutritionData?.instructions || t(recipe, 'instructions') || [];

    // Helper to detect time in step
    const detectTime = (text) => {
        if (!text || typeof text !== 'string') return null;
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

                {/* Share Button (Top Right) */}
                <div className="absolute top-6 right-6 z-50">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setIsShareModalOpen(true)}
                        className="rounded-full shadow-lg backdrop-blur-md bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-amber-600 hover:text-amber-500"
                    >
                        <Share2 size={20} />
                    </Button>
                </div>

            </div>

            {/* NEW Info Section (Below Hero) */}
            <div
                className="container mx-auto px-4 md:px-6 mt-8 mb-12"
                dir={language === 'fa' ? 'rtl' : 'ltr'}
            >


                {/* Share Modal */}
                <SocialShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    recipe={recipe}
                />

                {/* Content Layout */}                <div className="flex flex-col gap-6">
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
                        {(nutritionData?.description || recipe.nutrition_info?.[language]?.description || recipe.description) && (
                            <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-light italic max-w-2xl mx-auto">
                                "{nutritionData?.description || recipe.nutrition_info?.[language]?.description || recipe.description}"
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
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{getUiLabel('prep_time', language)}</span>
                                    <span className="font-bold text-sm md:text-base">{displayPrepTime} {getUiLabel('minutes', language)}</span>
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
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{getUiLabel('cook_time', language)}</span>
                                    <span className="font-bold text-sm md:text-base">{displayCookTime} {getUiLabel('minutes', language)}</span>
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
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Level</span>
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
                                    <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 px-3 py-2 rounded-lg border border-teal-100 dark:border-teal-800 text-teal-800 dark:text-teal-200">
                                        <Activity size={14} className="text-teal-600 dark:text-teal-400" />
                                        <span className="font-bold text-sm tracking-wide">{formatVal(nutritionData.calories, 'kcal')}</span>
                                    </div>
                                    {nutritionData.macros?.protein && (
                                        <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200">
                                            <Dumbbell size={14} className="text-indigo-600 dark:text-indigo-400" />
                                            <span className="font-bold text-sm tracking-wide">{getUiLabel('protein', language)}: {formatVal(nutritionData.macros.protein)}</span>
                                        </div>
                                    )}
                                    {nutritionData.macros?.carbs && (
                                        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-200">
                                            <Wheat size={14} className="text-blue-600 dark:text-blue-400" />
                                            <span className="font-bold text-sm tracking-wide">{getUiLabel('carbs', language)}: {formatVal(nutritionData.macros.carbs)}</span>
                                        </div>
                                    )}
                                    {nutritionData.macros?.fat && (
                                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                            <Droplet size={14} className="text-slate-500 dark:text-slate-400" />
                                            <span className="font-bold text-sm tracking-wide">{getUiLabel('fat', language)}: {formatVal(nutritionData.macros.fat)}</span>
                                        </div>
                                    )}
                                </>
                            );
                        })() : null}
                    </div>

                    {/* Health Benefits (Scientific Look) */}
                    {nutritionData?.health_benefits && nutritionData.health_benefits.length > 0 && (
                        <div className="w-full flex flex-col items-center mt-6 p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
                            <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Heart size={12} className="fill-emerald-600 dark:fill-emerald-500" />
                                {getUiLabel('health_benefits', language)}
                            </h4>
                            <div className="flex flex-wrap justify-center gap-2">
                                {nutritionData.health_benefits.map((benefit, idx) => (
                                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-white dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-medium shadow-sm">
                                        {benefit}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}


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

                                {nutritionData?.usage?.substitutions && nutritionData.usage.substitutions.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-border">
                                        <h4 className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">
                                            <span className="text-lg">🔄</span> {getUiLabel('chef_swaps', language)}
                                        </h4>
                                        <div className="flex flex-col gap-3">
                                            {nutritionData.usage.substitutions.map((sub, idx) => (
                                                <div key={idx} className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
                                                    <p className="font-medium text-foreground flex items-center gap-2 mb-1.5">
                                                        <span className="line-through decoration-red-400/50 text-muted-foreground">{sub.ingredient}</span>
                                                        <ArrowLeft size={12} className="rotate-180 text-amber-500" />
                                                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{sub.substitute}</span>
                                                    </p>
                                                    {sub.note && (
                                                        <div className="flex gap-1.5 items-start mt-1">
                                                            <div className="mt-1 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                                                            <p className="text-xs text-muted-foreground leading-relaxed">{sub.note}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </ul>

                            {/* 🚀 SUPER SCHEMA TAGS: High Visibility Header */}
                            {nutritionData?.tags && nutritionData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {/* Dietary Tags */}
                                    {nutritionData.dietary_tags && nutritionData.dietary_tags.map((tag, i) => (
                                        <Badge key={`diet-${i}`} variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                            🌱 {getUiLabel(tag, language)}
                                        </Badge>
                                    ))}
                                    {/* Occasion Tags */}
                                    {nutritionData.occasion_tags && nutritionData.occasion_tags.map((tag, i) => (
                                        <Badge key={`occasion-${i}`} variant="outline" className="border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400">
                                            🎉 {getUiLabel(tag, language)}
                                        </Badge>
                                    ))}
                                    {/* Difficulty & Cost */}
                                    {nutritionData.difficulty_level && (
                                        <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400">
                                            ⚡ {getUiLabel(nutritionData.difficulty_level, language)}
                                        </Badge>
                                    )}
                                    {nutritionData.estimated_cost && (
                                        <Badge variant="outline" className="border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-400">
                                            💰 {nutritionData.estimated_cost}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* 🎨 PREMIUM BENTO GRID LAYOUT (Revised: Horizontal Flow) */}
                            <div className="flex flex-col gap-6 mt-4 mb-12">


                                {/* 0. Zaffaron's Verdict (Scores) - NEW & POLISHED */}
                                {nutritionData?.internal_score && (
                                    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                                        <div className="bg-card border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                            <span className="text-2xl mb-1">❤️</span>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{getUiLabel('bento_health', language)}</span>
                                            <span className="text-lg font-bold text-emerald-600">{nutritionData.internal_score.health_score}%</span>
                                        </div>
                                        <div className="bg-card border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                            <span className="text-2xl mb-1">😋</span>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{getUiLabel('bento_taste', language)}</span>
                                            <span className="text-lg font-bold text-amber-500">{nutritionData.internal_score.taste_score}%</span>
                                        </div>
                                        <div className="bg-card border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                            <span className="text-2xl mb-1">🥳</span>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{getUiLabel('bento_joy', language)}</span>
                                            <span className="text-lg font-bold text-purple-500">{nutritionData.internal_score.marketing_joy_score}%</span>
                                        </div>
                                        <div className="bg-card border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                                            <span className="text-2xl mb-1">👨‍🍳</span>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{getUiLabel('bento_difficulty', language)}</span>
                                            <span className="text-lg font-bold text-blue-500">{nutritionData.internal_score.difficulty_score}/100</span>
                                        </div>
                                    </div>
                                )}

                                {/* 1. The Narrative (Origin + History) - Full Width */}
                                {nutritionData?.origin_history && (
                                    <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/10 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-amber-100 dark:border-amber-900/50 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-400/20 transition-all duration-700" />
                                        <h3 className="font-serif text-2xl text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                                            <span className="text-xl">📜</span> {getUiLabel('story_title', language)}
                                        </h3>
                                        <p className="text-amber-900/80 dark:text-amber-100/80 leading-relaxed font-medium">
                                            {nutritionData.origin_history}
                                        </p>
                                    </div>
                                )}

                                {/* 2. Flavor DNA (Horizontal Bars for Readability) - Full Width */}
                                {nutritionData?.flavor_profile && (
                                    <div className="w-full bg-card p-6 md:p-8 rounded-2xl md:rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span>🧬</span> {getUiLabel('flavor_dna', language)}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                            {Object.entries(nutritionData.flavor_profile).map(([key, val]) => {
                                                const flavorIcons = {
                                                    spicy: '🌶️',
                                                    sweet: '🍯',
                                                    bitter: '☕',
                                                    savory: '🍗',
                                                    sour: '🍋',
                                                    salty: '🧂',
                                                    umami: '🍄'
                                                };
                                                return (
                                                    <div key={key} className="flex items-center gap-4 group">
                                                        <div className="w-28 flex items-center justify-end gap-2">
                                                            <span className="text-sm shadow-sm p-0.5 rounded-full bg-white/50 dark:bg-black/20">{flavorIcons[key] || '🧬'}</span>
                                                            <span className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground/80 tracking-wide truncate">{getUiLabel(key, language)}</span>
                                                        </div>
                                                        <div className="flex-1 h-3 bg-muted/40 rounded-full overflow-hidden relative">
                                                            <div
                                                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 ${['savory', 'salty', 'umami'].includes(key) ? 'bg-amber-500' :
                                                                    ['spicy', 'sour'].includes(key) ? 'bg-rose-500' :
                                                                        ['sweet'].includes(key) ? 'bg-pink-500' :
                                                                            'bg-emerald-500'
                                                                    }`}
                                                                style={{ width: `${val * 10}%` }}
                                                            />
                                                        </div>
                                                        <span className="w-8 text-xs font-bold text-foreground/70">{val}/10</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* 3. Sensory Experience - Full Width */}
                                {nutritionData?.sensory_experience && (
                                    <div className="w-full bg-card p-6 md:p-8 rounded-2xl md:rounded-3xl border border-border/50 shadow-sm flex flex-col justify-center">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span>✨</span> {getUiLabel('sensory_profile', language)}
                                        </h3>
                                        <p className="text-xl md:text-2xl font-serif text-foreground/90 italic leading-relaxed text-center px-4 md:px-12 py-4">
                                            "{nutritionData.sensory_experience}"
                                        </p>
                                    </div>
                                )}

                                {/* 4. Chef's Mastery Guide (Stacked Rows) */}
                                {nutritionData?.chef_guide && (
                                    <div className="w-full mt-2 bg-zinc-900 text-zinc-100 dark:bg-white dark:text-zinc-900 p-1 rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
                                        <div className="bg-white/5 dark:bg-black/5 p-6 md:p-8 backdrop-blur-sm rounded-xl md:rounded-[20px]">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="p-2 bg-amber-500 text-black rounded-lg">
                                                    <ChefHat size={20} />
                                                </div>
                                                <h3 className="font-bold text-lg tracking-wide uppercase">{getUiLabel('chef_mastery', language)}</h3>
                                            </div>

                                            <div className="flex flex-col gap-6">
                                                {/* Pro Tip */}
                                                <div className="flex flex-col md:flex-row gap-4 items-start p-4 bg-white/5 dark:bg-black/5 rounded-xl border border-white/10 dark:border-black/10">
                                                    <div className="shrink-0 p-2 bg-emerald-500/10 rounded-lg text-emerald-400 dark:text-emerald-600">
                                                        <span className="text-xl">💡</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-emerald-400 dark:text-emerald-600 font-bold text-xs uppercase tracking-widest mb-1">{getUiLabel('tip_secret', language)}</h4>
                                                        <p className="text-sm opacity-90 leading-relaxed font-medium">{nutritionData.chef_guide.pro_tip}</p>
                                                    </div>
                                                </div>

                                                {/* Mistake */}
                                                <div className="flex flex-col md:flex-row gap-4 items-start p-4 bg-white/5 dark:bg-black/5 rounded-xl border border-white/10 dark:border-black/10">
                                                    <div className="shrink-0 p-2 bg-rose-500/10 rounded-lg text-rose-400 dark:text-rose-600">
                                                        <span className="text-xl">⚠️</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-rose-400 dark:text-rose-600 font-bold text-xs uppercase tracking-widest mb-1">{getUiLabel('tip_avoid', language)}</h4>
                                                        <p className="text-sm opacity-90 leading-relaxed font-medium">{nutritionData.chef_guide.common_mistake}</p>
                                                    </div>
                                                </div>

                                                {/* Storage */}
                                                <div className="flex flex-col md:flex-row gap-4 items-start p-4 bg-white/5 dark:bg-black/5 rounded-xl border border-white/10 dark:border-black/10">
                                                    <div className="shrink-0 p-2 bg-blue-500/10 rounded-lg text-blue-400 dark:text-blue-600">
                                                        <span className="text-xl">❄️</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-blue-400 dark:text-blue-600 font-bold text-xs uppercase tracking-widest mb-1">{getUiLabel('storage', language)}</h4>
                                                        <p className="text-sm opacity-90 leading-relaxed font-medium">{nutritionData.chef_guide.storage}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Legacy Description / Notes - Safety Checked */}
                            {!nutritionData?.origin_history && (nutritionData?.description || nutritionData?.chef_notes) && (
                                <div className="prose dark:prose-invert max-w-none mt-6">
                                    {nutritionData?.chef_notes && nutritionData?.chef_notes !== nutritionData?.description && (
                                        <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                            <h3 className="flex items-center gap-2 font-bold text-primary mb-3">
                                                <span className="text-x1">💡</span>
                                                {getUiLabel('chef_notes_title', language)}
                                            </h3>
                                            <div className="space-y-2 text-foreground/90 italic">
                                                {nutritionData?.chef_notes.split('\n').map((note, i) => (
                                                    <p key={i}>{note}</p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>


                        {/* HARDENING: Chef Transactional CTA (Digital Storefront) */}
                        <ChefCTA recipeId={recipe.id} recipeName={displayName} />

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
                                // Handle both string and structured object (Gemini 3)
                                let stepText = step;
                                let stepTime = null;

                                if (typeof step === 'object' && step !== null) {
                                    stepText = step.text || '';
                                    stepTime = step.metadata?.derived_duration_min;
                                }

                                // Fallback regex detection if no metadata time
                                if (!stepTime) {
                                    stepTime = detectTime(stepText);
                                }

                                return (
                                    <div key={idx} className={`group relative pl-8 pb-8 border-l border-border last:border-0 last:pb-0 ${language === 'fa' ? 'border-r border-l-0 pr-8 pl-0' : ''}`}>
                                        <div className={`absolute top-0 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary font-bold flex items-center justify-center text-sm shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 ${language === 'fa' ? '-right-4' : '-left-4'}`}>
                                            {language === 'fa' ? toPersianDigits(idx + 1) : idx + 1}
                                        </div>
                                        <div className="bg-muted/30 p-6 rounded-2xl hover:bg-muted/60 transition-colors">
                                            <p className={`text-lg leading-relaxed text-foreground/90 ${language === 'fa' ? 'text-right' : 'text-left'}`}>
                                                {language === 'fa' ? toPersianDigits(stepText) : stepText}
                                            </p>

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

                    {/* Chef's Mastery Guide (REMOVED: Duplicate of Bento Box version) */}


                </section>

            </div>
        </article >
    );
}
