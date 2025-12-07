import Image from 'next/image';
import Link from 'next/link';
import { Clock, ChefHat, Flame } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RecipeHeart from './RecipeHeart';
import RecipeShoppingBtn from './RecipeShoppingBtn';

const RecipeCard = ({ recipe }) => {
    // Fallback if recipe is incomplete
    if (!recipe) return null;

    // Generate slug if missing (basic fallback)
    const slug = recipe.slug || recipe.name.toLowerCase().replace(/\s+/g, '-');

    // Map difficulty to color (Saffron/Turquoise/Pomegranate theme logic)
    const getDifficultyColor = (diff) => {
        const d = (diff || '').toLowerCase();
        if (d === 'easy') return "bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200";
        if (d === 'medium') return "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-200";
        return "bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-200";
    };

    return (
        <div className="relative h-full group">
            {/* Heart Button Element - Outside generic Link or handled with z-index above link */}
            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                <RecipeShoppingBtn recipeId={recipe.id} ingredients={recipe.ingredients} />
                <RecipeHeart recipeId={recipe.id} />
            </div>

            <Link href={`/recipe/${slug}`} className="block h-full">
                <Card className="overflow-hidden border border-border/40 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    {/* Image Section */}
                    <div className="relative aspect-[4/3] overflow-hidden w-full bg-muted">
                        {recipe.image ? (
                            <Image
                                src={recipe.image}
                                alt={recipe.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                <ChefHat size={48} className="opacity-20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Category Badge overlay */}
                        <Badge variant="secondary" className="absolute top-3 left-3 backdrop-blur-md bg-white/70 dark:bg-black/50 text-xs font-medium z-10">
                            {recipe.category || 'General'}
                        </Badge>
                    </div>

                    {/* Content */}
                    <CardHeader className="p-4 pb-2">
                        <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-amber-600 transition-colors text-right">
                            {recipe.name}
                        </h3>
                    </CardHeader>

                    <CardContent className="p-4 pt-1 flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-2 text-right">
                            {recipe.instructions?.[0] ? recipe.instructions[0].slice(0, 80) + '...' : 'دستور پخت خوشمزه ایرانی...'}
                        </p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground border-t border-border/40 mt-auto bg-muted/20">
                        <div className="flex items-center gap-1">
                            <Clock size={14} className="text-amber-600" />
                            <span>{recipe.prep_time_minutes || 30} دقیقه</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Flame size={14} className="text-orange-500" />
                            <span>{recipe.difficulty || 'Medium'}</span>
                        </div>
                    </CardFooter>
                </Card>
            </Link>
        </div>
    );
};

export default RecipeCard;
