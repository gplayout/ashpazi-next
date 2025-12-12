'use client';

// Imports
import { getUiLabel } from '@/utils/dictionaries';
import { useLanguage } from '@/context/LanguageContext';
import { ChefHat, Star, Refrigerator } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
    const { language } = useLanguage();

    const title = getUiLabel('hero_title', language);
    const subtitle = getUiLabel('hero_subtitle', language);

    return (
        <section className="relative w-full py-20 px-6 bg-gradient-to-b from-primary/10 to-background flex flex-col items-center text-center space-y-6">
            <div className="p-3 bg-primary/20 rounded-full mb-2">
                <ChefHat size={40} className="text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                {title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
                {subtitle}
            </p>

            {/* AI Feature Cards */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Link href="/judge" className="group">
                    <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-full hover:bg-amber-500/20 transition-all duration-300 hover:scale-105">
                        <Star size={20} className="text-amber-600" />
                        <span className="font-medium text-amber-700 dark:text-amber-400">{getUiLabel('ai_judge', language)}</span>
                    </div>
                </Link>
                <Link href="/fridge" className="group">
                    <div className="flex items-center gap-3 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-full hover:bg-cyan-500/20 transition-all duration-300 hover:scale-105">
                        <Refrigerator size={20} className="text-cyan-600" />
                        <span className="font-medium text-cyan-700 dark:text-cyan-400">{getUiLabel('fridge_vision', language)}</span>
                    </div>
                </Link>
            </div>
        </section>
    );
}
