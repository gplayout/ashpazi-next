'use client';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { getUiLabel } from '@/utils/dictionaries';
import { toPersianDigits } from '@/utils/farsi';

export default function RecipeIngredients({
    language,
    displayIngredients,
    nutritionData,
}: {
    language: string;
    displayIngredients: string[];
    nutritionData: Record<string, any>;
}) {
    return (
        <aside className="space-y-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-8">
                <div dir={['fa', 'ar'].includes(language) ? 'rtl' : 'ltr'}>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="text-primary">●</span>{' '}
                        {getUiLabel('ingredients', language)}
                    </h2>
                    <ul className="space-y-3">
                        {displayIngredients && displayIngredients.length > 0 ? (
                            displayIngredients.map((ing, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50"
                                >
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                    <span className="leading-relaxed">
                                        {language === 'fa' ? toPersianDigits(ing) : ing}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <p className="text-muted-foreground italic text-center">
                                {getUiLabel('ingredients_embedded', language)}
                            </p>
                        )}
                    </ul>

                    {/* 5. Chef Swaps (MOVED from Bottom) - Enhanced Grid */}
                    {nutritionData?.chef_swaps &&
                        Object.keys(nutritionData.chef_swaps).length > 0 && (
                            <div className="mt-8 mb-8 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span>🔄</span> {getUiLabel('chef_swaps', language)}
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {Object.entries(
                                        nutritionData.chef_swaps as Record<string, string>
                                    ).map(([orig, swap]: [string, string]) => (
                                        <div
                                            key={orig}
                                            className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_auto_1fr] align-middle items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50"
                                        >
                                            <span className="font-medium text-muted-foreground line-through decoration-rose-500/50 decoration-2 text-sm">
                                                {orig}
                                            </span>
                                            <span className="text-lg px-2">➡️</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm leading-tight">
                                                {swap}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* 6. Pairing Suggestions (MOVED from Bottom) */}
                    {nutritionData?.pairing_suggestions &&
                        nutritionData.pairing_suggestions.length > 0 && (
                            <div className="mb-8 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span>🍷</span> {getUiLabel('pairing_suggestions', language)}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {nutritionData.pairing_suggestions.map(
                                        (pair: string, idx: number) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 bg-primary/10 text-primary font-bold rounded-full text-xs border border-primary/20"
                                            >
                                                {pair}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                    {/* 🚀 SUPER SCHEMA TAGS: High Visibility Header */}
                    {nutritionData?.tags && nutritionData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {/* Dietary Tags */}
                            {nutritionData.dietary_tags &&
                                nutritionData.dietary_tags.map((tag: string, i: number) => (
                                    <Badge
                                        key={`diet-${i}`}
                                        variant="secondary"
                                        className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                    >
                                        🌱 {getUiLabel(tag, language)}
                                    </Badge>
                                ))}
                            {/* Occasion Tags */}
                            {nutritionData.occasion_tags &&
                                nutritionData.occasion_tags.map((tag: string, i: number) => (
                                    <Badge
                                        key={`occasion-${i}`}
                                        variant="outline"
                                        className="border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                                    >
                                        🎉 {getUiLabel(tag, language)}
                                    </Badge>
                                ))}
                            {/* Difficulty & Cost */}
                            {nutritionData.difficulty_level && (
                                <Badge
                                    variant="outline"
                                    className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400"
                                >
                                    ⚡ {getUiLabel(nutritionData.difficulty_level, language)}
                                </Badge>
                            )}
                            {nutritionData.estimated_cost && (
                                <Badge
                                    variant="outline"
                                    className="border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-400"
                                >
                                    💰 {nutritionData.estimated_cost}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
