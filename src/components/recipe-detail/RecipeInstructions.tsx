'use client';
import React from 'react';

import { getUiLabel } from '@/utils/dictionaries';
import { toPersianDigits } from '@/utils/farsi';

export default function RecipeInstructions({
    language,
    displayInstructions,
    recipe,
}: {
    language: string;
    displayInstructions: (
        | string
        | {
              text?: string;
              metadata?: { derived_duration_min?: number; [k: string]: unknown };
              [k: string]: unknown;
          }
    )[];
    recipe: import('@/types').RecipeProps;
}) {
    // Helper to detect time in step
    const detectTime = (text: string | undefined): number | null => {
        if (!text || typeof text !== 'string') return null;
        const timeRegex =
            language === 'fa' ? /(\d+)\s*(دقیقه)/ : /(\d+)\s*(minute|min|minutes|mins)/i;
        const match = text.match(timeRegex);
        return match ? parseInt(match[1]) : null;
    };

    return (
        <section>
            <h2
                className={`text-3xl font-bold mb-8 pb-4 border-b border-border ${['fa', 'ar'].includes(language) ? 'text-right' : 'text-left'}`}
            >
                {getUiLabel('instructions', language)}
            </h2>
            <div className="space-y-8">
                {displayInstructions && displayInstructions.length > 0 ? (
                    displayInstructions.map((step, idx) => {
                        // Handle both string and structured object (Gemini 3)
                        let stepText: string =
                            typeof step === 'string' ? step : (step as any).text || '';
                        let stepTime: number | null = null;

                        if (typeof step === 'object' && step !== null) {
                            stepText = (step as any).text || '';
                            stepTime = (step as any).metadata?.derived_duration_min;
                        }

                        // Fallback regex detection if no metadata time
                        if (!stepTime) {
                            stepTime = detectTime(stepText);
                        }

                        // FIXED: Clean stepText of leading numbers (e.g. "1. Cook..." -> "Cook...")
                        stepText = stepText.replace(/^\d+[\.:]\s*/, '');

                        return (
                            <div
                                key={idx}
                                className={`group relative pl-8 pb-8 border-l border-border last:border-0 last:pb-0 ${['fa', 'ar'].includes(language) ? 'border-r border-l-0 pr-8 pl-0' : ''}`}
                            >
                                <div
                                    className={`absolute top-0 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary font-bold flex items-center justify-center text-sm shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 ${['fa', 'ar'].includes(language) ? '-right-4' : '-left-4'}`}
                                >
                                    {language === 'fa' ? toPersianDigits(idx + 1) : idx + 1}
                                </div>
                                <div className="bg-muted/30 p-6 rounded-2xl hover:bg-muted/60 transition-colors">
                                    <p
                                        className={`text-lg leading-relaxed text-foreground/90 ${['fa', 'ar'].includes(language) ? 'text-right' : 'text-left'}`}
                                    >
                                        {language === 'fa' ? toPersianDigits(stepText) : stepText}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-lg text-muted-foreground text-center">
                        {(recipe as any).original_text || getUiLabel('no_instructions', language)}
                    </p>
                )}
            </div>
        </section>
    );
}
