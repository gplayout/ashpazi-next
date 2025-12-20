'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ChefHat, Flame } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

    // Generate slug: Prefer English name for cleaner URLs, fallback to name
    const slugSource = recipe.name_en || recipe.name;
    const slug = recipe.slug || slugSource.toLowerCase().replace(/\s+/g, '-');

    // Localized fields
    const displayName = t(recipe, 'name');
    // --- Description Resolution Logic (Safe & Smart) ---
    const translations = recipe.recipe_translations || [];

    // Helper: Detect Farsi
    const isMostlyFarsi = (text) => {
        if (!text) return false;
        const farsiMatches = text.match(/[\u0600-\u06FF]/g);
        const count = farsiMatches ? farsiMatches.length : 0;
        return count > (text.length * 0.4);
    };

    // Helper: Extract Text
    const extractText = (field) => {
        if (!field) return [];
        let raw = field;
        if (typeof raw === 'string') {
            try { raw = JSON.parse(raw); } catch { raw = [raw]; }
        }
        if (!Array.isArray(raw) && typeof raw === 'object') raw = [raw];
        if (!Array.isArray(raw)) return [];
        return raw.map(step => (typeof step === 'object' && step?.text) ? step.text : step)
            .filter(s => typeof s === 'string' && s.trim().length > 5);
    };

    // 1. Target Language Content
    const targetTr = translations.find(t => t.language_code === language);
    let finalDescription = targetTr?.qa_metadata?.marketing_description ||
        targetTr?.qa_metadata?.seo_meta_description ||
        targetTr?.seo_meta_description ||
        targetTr?.description;

    if (!finalDescription && targetTr) {
        finalDescription = extractText(targetTr.instructions)[0];
    }

    // 2. English Fallback (Only if we are NOT in Farsi mode)
    // We assume explicit English translations are safe.
    if (!finalDescription && language !== 'fa') {
        const enTr = translations.find(t => t.language_code === 'en');
        if (enTr) {
            finalDescription = enTr.qa_metadata?.marketing_description ||
                enTr.qa_metadata?.seo_meta_description ||
                enTr.description ||
                extractText(enTr.instructions)[0];
        }
    }

    // 3. Legacy Fallback (The DANGEROUS ONE)
    // We only use Legacy if:
    // a) We are in Farsi mode (Legacy is assumed Farsi)
    // OR
    // b) The Legacy text is DETECTED as English (Not Farsi)
    if (!finalDescription) {
        const legacyText = extractText(recipe.instructions)[0];

        if (legacyText) {
            if (language === 'fa') {
                finalDescription = legacyText;
            } else {
                // English Mode: Check if legacy is Farsi
                if (!isMostlyFarsi(legacyText)) {
                    finalDescription = legacyText;
                }
                // If it IS Farsi, we silently skip it and fall to Default
            }
        }
    }

    // 4. Default
    if (!finalDescription || finalDescription.startsWith('TEST_')) {
        finalDescription = getUiLabel('default_description', language);
    }

    // Cleanup
    if (finalDescription && finalDescription.startsWith('Step 1:')) {
        finalDescription = finalDescription.replace('Step 1:', '').trim();
    }



    const prepTime = recipe.prep_time_minutes || 30;
    const displayTime = language === 'fa' ? toPersianDigits(prepTime) : prepTime;

    const difficulty = recipe.difficulty || 'Medium';
    // Use getUiLabel for difficulty or fallback to original (which is usually English 'Medium')
    const displayDifficulty = getUiLabel(difficulty, language);

    const category = recipe.category || 'General';

    return (
        <div className="relative h-full group">
            {/* Heart/Shopping - Outside generic Link */}
            {/* Heart/Shopping - Always visible on mobile, hover on desktop */}
            <div className="absolute top-3 right-3 z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                <RecipeShoppingBtn recipeId={recipe.id} ingredients={recipe.ingredients} />
                <RecipeHeart recipeId={recipe.id} />
            </div>

            <Link href={`/recipe/${slug}?id=${recipe.id}`} className="block h-full">
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
                            {getUiLabel(category, language)}
                        </Badge>
                    </div>

                    {/* Content */}
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className={`text-lg font-bold leading-tight line-clamp-2group-hover:text-primary transition-colors ${language === 'fa' ? 'font-vazirmatn text-right' : 'font-outfit text-left'}`}>
                            {displayName}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 pt-1 flex-grow">
                        <p className={`text-sm text-muted-foreground line-clamp-2 ${language === 'fa' ? 'text-right' : 'text-left'}`}>
                            {finalDescription}
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
