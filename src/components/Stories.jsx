'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChefHat } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getUiLabel } from '@/utils/dictionaries';
// Sub-component for individual story content to handle hooks
function StoryContent({ story }) {
    const { language, t } = useLanguage();

    // AI/Chef Zaffaron Data Extraction
    // FIX: Use current language, fallback to EN if specific translation missing
    const translation = story.recipe_translations?.find(tr => tr.language_code === language)
        || story.recipe_translations?.find(tr => tr.language_code === 'en');

    const metadata = translation?.qa_metadata;
    const isChefPick = (metadata?.internal_score?.marketing_joy_score || 0) > 85;

    // Prefer AI Title/Desc -> Default Translation -> Raw
    const displayName = translation?.title || t(story, 'name');
    const displayDescription = metadata?.marketing_description || t(story, 'description') || story.intro;

    return (
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4 text-white" dir={language === 'fa' ? 'rtl' : 'ltr'}>
            <div>
                {isChefPick && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-amber-300 text-sm font-bold uppercase tracking-wider mb-2 bg-black/40 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-amber-500/30"
                    >
                        <ChefHat size={16} className="text-amber-400 drop-shadow-lg" />
                        <span>{getUiLabel('chef_pick_label', language)}</span>
                    </motion.div>
                )}

                {!isChefPick && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-bold uppercase tracking-wider mb-2">
                        <span>{getUiLabel('todays_pick', language)}</span>
                    </div>
                )}

                <h2 className="text-2xl font-black leading-tight mb-2 drop-shadow-md">
                    {displayName}
                </h2>
                <p className="text-sm opacity-90 line-clamp-3 leading-relaxed font-medium drop-shadow-sm text-zinc-100">
                    {displayDescription}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Link
                    href={`/recipe/${story.id}`}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 z-50 relative shadow-xl hover:bg-amber-50"
                >
                    {getUiLabel('view_recipe', language)}
                </Link>
            </div>
        </div>
    );
}

export default function Stories({ recipes = [] }) {
    const { language, t } = useLanguage();
    const [viewingIndex, setViewingIndex] = useState(null);
    const [progress, setProgress] = useState(0);
    // Load seen stories from localStorage
    const [seenStories, setSeenStories] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('seen_stories');
        if (stored) {
            setSeenStories(JSON.parse(stored));
        }
    }, []);

    const markAsSeen = (id) => {
        if (!seenStories.includes(id)) {
            const newSeen = [...seenStories, id];
            setSeenStories(newSeen);
            localStorage.setItem('seen_stories', JSON.stringify(newSeen));
        }
    };

    // Filter valid recipes with images & Prioritize Chef Picks
    const validStories = recipes
        .filter(r => r.image && r.image.length > 5)
        .sort((a, b) => {
            // Sort by Marketing Score if available
            const scoreA = a.recipe_translations?.[0]?.qa_metadata?.internal_score?.marketing_joy_score || 0;
            const scoreB = b.recipe_translations?.[0]?.qa_metadata?.internal_score?.marketing_joy_score || 0;
            return scoreB - scoreA; // Descending
        })
        .slice(0, 10);
    const displayStories = validStories;

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
            const nextIndex = viewingIndex + 1;
            setViewingIndex(nextIndex);
            markAsSeen(displayStories[nextIndex].id);
        } else {
            setViewingIndex(null); // Close on end
        }
    };

    const handlePrev = () => {
        if (viewingIndex !== null && viewingIndex > 0) {
            const prevIndex = viewingIndex - 1;
            setViewingIndex(prevIndex);
            markAsSeen(displayStories[prevIndex].id);
        }
    };

    const handleStoryClick = (idx, recipeId) => {
        setViewingIndex(idx);
        markAsSeen(recipeId);
    };

    if (validStories.length === 0) {
        return null;
    }

    return (
        <>
            <section className="py-4 px-4 md:px-6 overflow-x-auto scrollbar-hide select-none bg-zinc-50 dark:bg-zinc-900 border-b border-border/50 relative z-30 shadow-sm min-h-[120px]">
                <div className="flex gap-4 md:gap-6 min-w-max md:min-w-0 md:justify-center mx-auto max-w-7xl">
                    {displayStories.map((recipe, idx) => {
                        const isSeen = seenStories.includes(recipe.id);
                        return (
                            <button
                                key={recipe.id}
                                onClick={() => handleStoryClick(idx, recipe.id)}
                                className="flex flex-col items-center gap-2 group cursor-pointer"
                            >
                                {/* Ring with Pulse Animation */}
                                <div className="relative">
                                    {/* Pulse Effect - Only if NOT seen */}
                                    {!isSeen && (
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-600 blur opacity-70 animate-pulse"></div>
                                    )}

                                    {/* Main Ring */}
                                    <div className={`relative p-[3px] rounded-full transition-all duration-300 group-hover:scale-105 ${isSeen
                                        ? 'bg-zinc-300 dark:bg-zinc-700' // Gray if seen
                                        : 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-600' // Colored if new
                                        }`}>
                                        <div className="p-[2px] rounded-full bg-background">
                                            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden">
                                                <Image
                                                    src={recipe.image}
                                                    alt={recipe.name_en}
                                                    fill
                                                    className={`object-cover transition-opacity ${isSeen ? 'opacity-80' : 'opacity-100'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* "New" Badge - Only if NOT seen */}
                                    {!isSeen && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border-2 border-background shadow-sm z-10">
                                            NEW
                                        </div>
                                    )}
                                </div>
                                {/* Label */}
                                <span className={`text-xs font-medium w-20 text-center truncate ${isSeen ? 'text-zinc-400 dark:text-zinc-500' : 'text-foreground/80'
                                    }`}>
                                    {t(recipe, 'name')}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Full Screen Viewer - Via Portal */}
            <AnimatePresence>
                {viewingIndex !== null && (
                    <StoryViewerPortal>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-0 md:p-8"
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

                            {/* Story Container - Card Style on Mobile too */}
                            <div className="relative w-[95vw] h-[85vh] md:w-[400px] md:h-[80vh] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 border border-white/10">

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
                                    className="absolute top-4 right-4 z-30 text-white drop-shadow-md p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors"
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

                                {/* Content Overlay - Refactored to Sub-Component */}
                                <StoryContent story={displayStories[viewingIndex]} />

                                {/* Tap Areas */}
                                <div className="absolute inset-0 flex z-0">
                                    <div className="w-1/3 h-full" onClick={handlePrev} />
                                    <div className="w-2/3 h-full" onClick={handleNext} />
                                </div>
                            </div>

                        </motion.div >
                    </StoryViewerPortal >
                )}
            </AnimatePresence >
        </>
    );
}

// Helper Component for Portal
function StoryViewerPortal({ children }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    if (!mounted) return null;
    return createPortal(children, document.body);
}
