'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getUiLabel } from '@/utils/dictionaries';
import { Activity, Flame, Heart, Leaf, Info, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function NutritionAI({ recipe, data: initialData, isLoading }) {
    const { language } = useLanguage();
    const [data, setData] = useState(initialData || null);

    // Internal state for standalone usage
    const [internalLoading, setInternalLoading] = useState(true);
    const [error, setError] = useState(false);

    // Determine effective loading state
    // If isLoading (prop) is passed, use it. Otherwise use internalLoading unless initialData is present.
    const isControlled = isLoading !== undefined || initialData !== undefined;
    const effectiveLoading = isLoading !== undefined ? isLoading : (initialData ? false : internalLoading);

    useEffect(() => {
        if (initialData) {
            setData(initialData);
            if (!isControlled) setInternalLoading(false);
            return;
        }

        // If controlled (isLoading passed), parent handles fetching. do nothing.
        if (isLoading !== undefined) return;

        // Standalone Fetch Logic (Legacy)
        const title = recipe.name || recipe.title;
        if (!title) return;

        const fetchNutrition = async () => {
            try {
                const res = await fetch('/api/nutrition', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title,
                        ingredients: recipe.ingredients,
                        language
                    })
                });
                if (!res.ok) throw new Error('Failed to fetch');
                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setInternalLoading(false);
            }
        };

        fetchNutrition();
    }, [recipe.name, recipe.title, language, initialData, isLoading]);

    if (error) return null; // Hide if fails

    if (effectiveLoading) {
        return (
            <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-border animate-pulse mt-8">
                <div className="h-6 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
                <div className="flex gap-4 mb-6">
                    <div className="h-20 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                        <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <div className="flex items-center gap-2 mb-4">
                <Activity className="text-emerald-500" />
                <h3 className="text-xl font-bold">{getUiLabel('nutrition_facts', language)}</h3>
            </div>

            <div className="flex flex-col gap-4">

                {/* Calories Card */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Leaf size={80} />
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-zinc-500 text-sm font-medium mb-1">{getUiLabel('calories', language)}</p>
                            <h4 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">
                                {data.calories}
                                <span className="text-sm text-zinc-400 font-normal ml-1">kcal</span>
                            </h4>
                        </div>
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl">
                            <Flame className="text-emerald-600 dark:text-emerald-400" size={24} />
                        </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'protein', value: data.macros?.protein, color: 'bg-blue-500' },
                            { label: 'carbs', value: data.macros?.carbs, color: 'bg-amber-500' },
                            { label: 'fat', value: data.macros?.fat, color: 'bg-rose-500' }
                        ].map((macro) => (
                            <div key={macro.label} className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl text-center">
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">{getUiLabel(macro.label, language)}</p>
                                <p className="font-bold text-base">{macro.value || '-'}</p>
                                <div className={`w-full h-1 mt-1 rounded-full opacity-50 ${macro.color}`}></div>
                            </div>
                        ))}
                    </div>

                    {/* Diet Labels */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                        {data.diet_labels?.map(label => (
                            <Badge key={label} variant="secondary" className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                                {label}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Chef Insight */}
                {data.chef_insight && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                        <div className="flex items-start gap-3">
                            <div className="bg-white dark:bg-zinc-800 p-1.5 rounded-full shadow-sm shrink-0">
                                <ChefHat className="text-amber-600" size={18} />
                            </div>
                            <div>
                                <h5 className="font-bold text-amber-900 dark:text-amber-200 mb-1 text-sm">
                                    {getUiLabel('chef_insight', language)}
                                </h5>
                                <p className="text-amber-800 dark:text-amber-100/80 leading-relaxed text-xs italic">
                                    "{data.chef_insight}"
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Health Benefits */}
                {data.health_benefits && (
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <h5 className="font-bold mb-3 flex items-center gap-2 text-sm">
                            <Heart className="text-rose-500" size={16} />
                            {getUiLabel('health_benefits', language)}
                        </h5>
                        <ul className="space-y-2">
                            {data.health_benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                    <span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </div>
        </motion.div>
    );
}
