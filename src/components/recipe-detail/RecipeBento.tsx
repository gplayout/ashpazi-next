'use client';
import React from 'react';

import { ChefHat } from 'lucide-react';
import { getUiLabel } from '@/utils/dictionaries';

export default function RecipeBento({
    nutritionData,
    language,
}: {
    nutritionData: Record<string, any>;
    language: string;
}) {
    return (
        <div className="flex flex-col gap-6 mt-4 mb-12">
            {/* 0. Zaffaron's Verdict (Scores) - NEW & POLISHED */}
            {nutritionData?.internal_score && (
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                    <div className="bg-card border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-2xl mb-1">❤️</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {getUiLabel('bento_health', language)}
                        </span>
                        <span className="text-lg font-bold text-emerald-600">
                            {nutritionData.internal_score.health_score}%
                        </span>
                    </div>
                    <div className="bg-card border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-2xl mb-1">😋</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {getUiLabel('bento_taste', language)}
                        </span>
                        <span className="text-lg font-bold text-amber-500">
                            {nutritionData.internal_score.taste_score}%
                        </span>
                    </div>
                    <div className="bg-card border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-2xl mb-1">🥳</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {getUiLabel('bento_joy', language)}
                        </span>
                        <span className="text-lg font-bold text-purple-500">
                            {nutritionData.internal_score.marketing_joy_score}%
                        </span>
                    </div>
                    <div className="bg-card border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-2xl mb-1">👨‍🍳</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {getUiLabel('bento_difficulty', language)}
                        </span>
                        <span className="text-lg font-bold text-blue-500">
                            {nutritionData.internal_score.difficulty_score}/100
                        </span>
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
                                umami: '🍄',
                            };
                            return (
                                <div key={key} className="flex items-center gap-4 group">
                                    <div className="w-28 flex items-center justify-end gap-2">
                                        <span className="text-sm shadow-sm p-0.5 rounded-full bg-white/50 dark:bg-black/20">
                                            {(flavorIcons as Record<string, string>)[key] || '🧬'}
                                        </span>
                                        <span className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground/80 tracking-wide truncate">
                                            {getUiLabel(key, language)}
                                        </span>
                                    </div>
                                    <div className="flex-1 h-3 bg-muted/40 rounded-full overflow-hidden relative">
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 ${
                                                ['savory', 'salty', 'umami'].includes(key)
                                                    ? 'bg-amber-500'
                                                    : ['spicy', 'sour'].includes(key)
                                                      ? 'bg-rose-500'
                                                      : ['sweet'].includes(key)
                                                        ? 'bg-pink-500'
                                                        : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${(val as number) * 10}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-xs font-bold text-foreground/70">
                                        {String(val)}/10
                                    </span>
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

            {/* 3.1 Chef Swaps - NEW */}
            {nutritionData?.chef_swaps && (
                <div className="w-full bg-card p-6 md:p-8 rounded-2xl md:rounded-3xl border border-border/50 shadow-sm flex flex-col justify-center mt-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span>🔄</span> {getUiLabel('swaps_title', language) || 'Chef Swaps'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(nutritionData.chef_swaps as Record<string, string>).map(
                            ([key, val]: [string, string]) => (
                                <div
                                    key={key}
                                    className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl"
                                >
                                    <span className="text-xl">👩‍🍳</span>
                                    <div>
                                        <span className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                                            {key.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-sm font-medium text-foreground">
                                            {String(val)}
                                        </span>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
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
                            <h3 className="font-bold text-lg tracking-wide uppercase">
                                {getUiLabel('chef_mastery', language)}
                            </h3>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Pro Tip */}
                            <div className="flex flex-col md:flex-row gap-4 items-start p-4 bg-white/5 dark:bg-black/5 rounded-xl border border-white/10 dark:border-black/10">
                                <div className="shrink-0 p-2 bg-emerald-500/10 rounded-lg text-emerald-400 dark:text-emerald-600">
                                    <span className="text-xl">💡</span>
                                </div>
                                <div>
                                    <h4 className="text-emerald-400 dark:text-emerald-600 font-bold text-xs uppercase tracking-widest mb-1">
                                        {getUiLabel('tip_secret', language)}
                                    </h4>
                                    <p className="text-sm opacity-90 leading-relaxed font-medium">
                                        {nutritionData.chef_guide.pro_tip}
                                    </p>
                                </div>
                            </div>

                            {/* Mistake */}
                            <div className="flex flex-col md:flex-row gap-4 items-start p-4 bg-white/5 dark:bg-black/5 rounded-xl border border-white/10 dark:border-black/10">
                                <div className="shrink-0 p-2 bg-rose-500/10 rounded-lg text-rose-400 dark:text-rose-600">
                                    <span className="text-xl">⚠️</span>
                                </div>
                                <div>
                                    <h4 className="text-rose-400 dark:text-rose-600 font-bold text-xs uppercase tracking-widest mb-1">
                                        {getUiLabel('tip_avoid', language)}
                                    </h4>
                                    <p className="text-sm opacity-90 leading-relaxed font-medium">
                                        {nutritionData.chef_guide.common_mistake}
                                    </p>
                                </div>
                            </div>

                            {/* Storage */}
                            <div className="flex flex-col md:flex-row gap-4 items-start p-4 bg-white/5 dark:bg-black/5 rounded-xl border border-white/10 dark:border-black/10">
                                <div className="shrink-0 p-2 bg-blue-500/10 rounded-lg text-blue-400 dark:text-blue-600">
                                    <span className="text-xl">❄️</span>
                                </div>
                                <div>
                                    <h4 className="text-blue-400 dark:text-blue-600 font-bold text-xs uppercase tracking-widest mb-1">
                                        {getUiLabel('storage', language)}
                                    </h4>
                                    <p className="text-sm opacity-90 leading-relaxed font-medium">
                                        {nutritionData.chef_guide.storage}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Legacy Description / Notes - Safety Checked */}
            {!nutritionData?.origin_history &&
                (nutritionData?.description || nutritionData?.chef_notes) && (
                    <div className="prose dark:prose-invert max-w-none mt-6">
                        {nutritionData?.chef_notes &&
                            nutritionData?.chef_notes !== nutritionData?.description && (
                                <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                    <h3 className="flex items-center gap-2 font-bold text-primary mb-3">
                                        <span className="text-x1">💡</span>
                                        {getUiLabel('chef_notes_title', language)}
                                    </h3>
                                    <div className="space-y-2 text-foreground/90 italic">
                                        {nutritionData?.chef_notes
                                            .split('\n')
                                            .map((note: string, i: number) => (
                                                <p key={i}>{note}</p>
                                            ))}
                                    </div>
                                </div>
                            )}
                    </div>
                )}
        </div>
    );
}
