'use client';
import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Share2, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecipeHero({
    recipe,
    displayName,
    onShare,
}: {
    recipe: import('@/types').RecipeProps;
    displayName: string;
    onShare: () => void;
}) {
    return (
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
                    <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full shadow-lg backdrop-blur-md bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
            </div>

            {/* Share Button (Top Right) */}
            <div className="absolute top-6 right-6 z-50">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={onShare}
                    className="rounded-full shadow-lg backdrop-blur-md bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-amber-600 hover:text-amber-500"
                >
                    <Share2 size={20} />
                </Button>
            </div>
        </div>
    );
}
