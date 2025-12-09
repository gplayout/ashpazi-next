'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ChefHat, Flame } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RecipeHeart from './RecipeHeart';
import RecipeShoppingBtn from './RecipeShoppingBtn';

import { useLanguage } from '@/context/LanguageContext';
import { toPersianDigits, difficultyMap } from '@/utils/farsi';

// Imports
import { getUiLabel } from '@/utils/dictionaries';

const RecipeCard = ({ recipe }) => {
    const { language, t } = useLanguage();

    // Fallback if recipe is incomplete
    if (!recipe) return null;

    // Generate slug if missing (basic fallback)
    const slug = recipe.slug || recipe.name.toLowerCase().replace(/\s+/g, '-');

    // Localized fields
    const displayName = t(recipe, 'name');
    const instructions = t(recipe, 'instructions') || [];
    const displayInstructions = instructions[0] || '';

    const prepTime = recipe.prep_time_minutes || 30;
    const displayTime = language === 'fa' ? toPersianDigits(prepTime) : prepTime;

    const difficulty = recipe.difficulty || 'Medium';
    // Use getUiLabel for difficulty or fallback to original (which is usually English 'Medium')
    const displayDifficulty = getUiLabel(difficulty, language);

    const category = recipe.category || 'General';

    return (
        <div className="relative h-full group">
            {/* Heart/Shopping - Outside generic Link */}
            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                <RecipeShoppingBtn recipeId={recipe.id} ingredients={recipe.ingredients} />
                <RecipeHeart recipeId={recipe.id} />
            </div>

            <Link href={`/recipe/${slug}`} className="block h-full">
                <Card className="overflow-hidden border border-border/40 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    {/* Image Section */}
                    <div className="relative aspect-[4/3] overflow-hidden w-full bg-muted">
                        {recipe.image ? (
                            <img
                                src={recipe.image}
                                alt={displayName}
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                <ChefHat size={48} className="opacity-20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Category Badge overlay */}
                        <Badge variant="secondary" className="absolute top-3 left-3 backdrop-blur-md bg-white/70 dark:bg-black/50 text-xs font-medium z-10">
                            {category}
                        </Badge>
                    </div>

                    {/* Content */}
                    <CardHeader className="p-4 pb-2">
                        <h3 className={`font-bold text-lg leading-tight line-clamp-2 group-hover:text-amber-600 transition-colors ${language === 'fa' ? 'text-right' : 'text-left'}`}>
                            {displayName}
                        </h3>
                    </CardHeader>

                    <CardContent className="p-4 pt-1 flex-grow">
                        <p className={`text-sm text-muted-foreground line-clamp-2 ${language === 'fa' ? 'text-right' : 'text-left'}`}>
                            {displayInstructions ? displayInstructions.slice(0, 80) + '...' : (language === 'fa' ? 'دستور پخت خوشمزه...' : 'A delicious recipe...')}
                        </p>
                    </CardContent>

                    <CardFooter className={`p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground border-t border-border/40 mt-auto bg-muted/20 ${language === 'fa' ? 'flex-row-reverse' : ''}`}>
                        <div className="flex items-center gap-1">
                            <Clock size={14} className="text-amber-600" />
                            <span>{displayTime} {getUiLabel('minutes', language)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Flame size={14} className="text-orange-500" />
                            <span>{displayDifficulty}</span>
                        </div>
                    </CardFooter>
                </Card>
            </Link>
        </div>
    );
};

export default RecipeCard;
