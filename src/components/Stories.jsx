
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Clock, ChefHat } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Stories({ recipes = [] }) {
    const { language, t } = useLanguage();
    const [viewingIndex, setViewingIndex] = useState(null);
    const [progress, setProgress] = useState(0);

    // Filter valid recipes with images
    const validStories = recipes.filter(r => r.image && r.image.length > 5).slice(0, 10);

    // Auto-Advance Logic
    useEffect(() => {
        let timer;
        if (viewingIndex !== null) {
            setProgress(0);
            const duration = 5000; // 5s per story
            const interval = 50;

            timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        handleNext();
                        return 0;
                    }
                    return prev + (100 / (duration / interval));
                });
            }, interval);
        }
        return () => clearInterval(timer);
    }, [viewingIndex]);

    const handleNext = () => {
        if (viewingIndex !== null && viewingIndex < displayStories.length - 1) {
            setViewingIndex(viewingIndex + 1);
        } else {
            setViewingIndex(null); // Close on end
        }
    };

    const handlePrev = () => {
        if (viewingIndex !== null && viewingIndex > 0) {
            setViewingIndex(viewingIndex - 1);
        }
    };

    // Debug list
    useEffect(() => {
        // console.log("Stories Active Items:", validStories.length);
    }, [validStories.length]);

    // Debug logging
    console.log("Stories Component Debug:", {
        totalRecipes: recipes?.length,
        validStories: validStories.length,
        firstRecipeImage: recipes?.[0]?.image,
        envCheck: !!process.env.NEXT_PUBLIC_SUPABASE_URL
    });

    // Force add a dummy story for visual verification
    const debugStory = {
        id: 'debug-1',
        name_en: 'Debug Story',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        nutrition_info: { en: { description: 'Debug Description' } }
    };

    // Combine real + debug
    const displayStories = [...validStories, debugStory];

    if (validStories.length === 0) {
        // High visibility debug box
        return (
            <div className="fixed top-24 left-4 z-[9999] p-4 bg-red-600 text-white font-bold rounded-lg shadow-2xl border-4 border-yellow-400">
                <p>DEBUG MODE ACTIVE</p>
                <p>Recipes Fetched: {recipes?.length || 0}</p>
                <p>Valid Stories: {validStories.length}</p>
                <p>Supabase Configured: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'YES' : 'NO'}</p>
            </div>
        );
    }

    return (
        <section className="py-4 px-4 md:px-6 overflow-x-auto scrollbar-hide select-none bg-background border-b border-border/50 sticky top-[56px] z-40 shadow-sm min-h-[110px]">
            <div className="flex gap-4 md:gap-6 min-w-max">
                {displayStories.map((recipe, idx) => (
                    <button
                        key={recipe.id}
                        onClick={() => setViewingIndex(idx)}
                        className="flex flex-col items-center gap-2 group cursor-pointer"
                    >
                        {/* Ring */}
                        <div className="p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-600 group-hover:scale-105 transition-transform duration-300">
                            <div className="p-[2px] rounded-full bg-background">
                                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden">
                                    <Image
                                        src={recipe.image}
                                        alt={recipe.name_en}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Label */}
                        <span className="text-xs font-medium text-foreground/80 truncate w-20 text-center">
                            {t(recipe, 'name')}
                        </span>
                    </button>
                ))}
            </div>

            {/* Full Screen Viewer */}
            <AnimatePresence>
                {viewingIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-0 md:p-8"
                    >
                        {/* Background Blur */}
                        <div className="absolute inset-0 z-0 opacity-50 blur-3xl">
                            <Image
                                src={validStories[viewingIndex].image}
                                alt="blur"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Story Container */}
                        <div className="relative w-full h-full md:w-[400px] md:h-[80vh] bg-black md:rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 border border-white/10">

                            {/* Progress Bar */}
                            <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
                                {displayStories.map((_, idx) => (
                                    <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-white transition-all duration-100 ${idx < viewingIndex ? 'w-full' :
                                                idx === viewingIndex ? 'w-full origin-left' : 'w-0'
                                                }`}
                                            style={{
                                                width: idx === viewingIndex ? `${progress}%` : undefined
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setViewingIndex(null)}
                                className="absolute top-4 right-4 z-30 text-white drop-shadow-md p-2"
                            >
                                <X size={24} />
                            </button>

                            {/* Main Image */}
                            <div className="relative flex-1">
                                <Image
                                    src={displayStories[viewingIndex].image}
                                    alt="story"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/50 to-transparent" />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4 text-white" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                                <div>
                                    <div className="flex items-center gap-2 text-amber-400 text-sm font-bold uppercase tracking-wider mb-2">
                                        <ChefHat size={16} />
                                        <span>{language === 'fa' ? 'پیشنهاد امروز' : 'Today\'s Pick'}</span>
                                    </div>
                                    <h2 className="text-2xl font-black leading-tight mb-2">
                                        {t(displayStories[viewingIndex], 'name')}
                                    </h2>
                                    {/* AI Description Teaser */}
                                    <p className="text-sm opacity-80 line-clamp-3 leading-relaxed">
                                        {displayStories[viewingIndex].nutrition_info?.[language]?.description?.split('**')[0] || ""}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Link href={`/recipe/${displayStories[viewingIndex].id}?id=${displayStories[viewingIndex].id}`} passHref>
                                        <button className="w-full py-3 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                                            {language === 'fa' ? 'مشاهده دستور' : 'View Recipe'}
                                        </button>
                                    </Link>
                                    <button
                                        className="w-full py-3 bg-white/10 backdrop-blur border border-white/20 text-white font-semibold rounded-xl active:scale-95 transition-transform"
                                    >
                                        Some Action
                                    </button>
                                </div>
                            </div>

                            {/* Tap Areas */}
                            <div className="absolute inset-0 flex z-0">
                                <div className="w-1/3 h-full" onClick={handlePrev} />
                                <div className="w-2/3 h-full" onClick={handleNext} />
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
