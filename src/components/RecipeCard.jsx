import Image from 'next/image';
import Link from 'next/link';
import { Clock, ChefHat, Flame } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <Link href={`/recipe/${slug}`}>
            <Card className="group overflow-hidden border border-border/40 bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
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
                    <Badge variant="secondary" className="absolute top-3 left-3 backdrop-blur-md bg-white/70 dark:bg-black/50 text-xs font-medium">
                        {recipe.category || 'General'}
                    </Badge>
                </div>

                {/* Content */}
                <CardHeader className="p-4 pb-2">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {recipe.name}
                    </h3>
                </CardHeader>

                <CardContent className="p-4 pt-1 flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {recipe.instructions?.[0] ? recipe.instructions[0].slice(0, 80) + '...' : 'Delicious Persian recipe...'}
                    </p>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground border-t border-border/40 mt-auto bg-muted/20">
                    <div className="flex items-center gap-1">
                        <Clock size={14} className="text-primary" />
                        <span>{recipe.prep_time_minutes || 30}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Flame size={14} className="text-orange-500" />
                        <span>{recipe.difficulty || 'Medium'}</span>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
};

export default RecipeCard;
