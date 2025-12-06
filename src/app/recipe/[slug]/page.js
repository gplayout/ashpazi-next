import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getRecipeBySlug } from '@/lib/data';
import { Clock, Flame, ChefHat, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

// SEO Metadata Generation
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const recipe = await getRecipeBySlug(slug);
    if (!recipe) return { title: 'Recipe Not Found' };

    return {
        title: `${recipe.name} | Zaffaron Recipes`,
        description: `Learn how to cook authentic ${recipe.name}. ${recipe.instructions?.[0]?.slice(0, 100) || ''}...`,
        openGraph: {
            images: [recipe.image || '/og-default.jpg'],
        },
    };
}

export default async function RecipePage({ params }) {
    const { slug } = await params;
    const recipe = await getRecipeBySlug(slug);

    if (!recipe) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-background pb-20">
            {/* Hero / Header with Parallax-like Image */}
            <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
                {recipe.image ? (
                    <Image
                        src={recipe.image}
                        alt={recipe.name}
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
                        <Button variant="secondary" size="icon" className="rounded-full shadow-lg backdrop-blur-md bg-white/70 dark:bg-black/50 hover:bg-white dark:hover:bg-black">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="container mx-auto">
                        <Badge className="mb-4 text-base px-3 py-1 bg-primary text-primary-foreground border-none">
                            {recipe.category || 'Persian Cuisine'}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black text-foreground drop-shadow-sm leading-tight mb-4">
                            {recipe.name}
                        </h1>

                        {/* Meta Stats */}
                        <div className="flex flex-wrap gap-6 text-sm md:text-base font-medium text-foreground/80">
                            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
                                <Clock size={18} className="text-primary" />
                                <span>Prep: {recipe.prep_time_minutes || 30}m</span>
                            </div>
                            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
                                <Flame size={18} className="text-orange-500" />
                                <span>Cook: {recipe.cook_time_minutes || 45}m</span>
                            </div>
                            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
                                <ChefHat size={18} className="text-purple-500" />
                                <span>{recipe.difficulty || 'Medium'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Layout */}
            <div className="container mx-auto px-4 md:px-6 mt-12 grid md:grid-cols-[1fr_2fr] gap-12">

                {/* Sidebar: Ingredients */}
                <aside className="space-y-8">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-primary">●</span> Ingredients
                        </h2>
                        <ul className="space-y-3">
                            {recipe.ingredients && recipe.ingredients.length > 0 ? (
                                recipe.ingredients.map((ing, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                        <span className="leading-relaxed">{ing}</span>
                                    </li>
                                ))
                            ) : (
                                <p className="text-muted-foreground italic">
                                    Ingredients are embedded in the instructions for this recipe.
                                </p>
                            )}
                        </ul>

                        {/* Action Button */}
                        <Button className="w-full mt-8 font-bold text-lg h-12 rounded-xl shadow-md border-b-4 border-primary/20 active:border-b-0 active:translate-y-1 transition-all">
                            Start Cooking Mode
                        </Button>
                    </div>
                </aside>

                {/* Main: Instructions */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 pb-4 border-b border-border">Instructions</h2>
                    <div className="space-y-8">
                        {recipe.instructions && recipe.instructions.length > 0 ? (
                            recipe.instructions.map((step, idx) => (
                                <div key={idx} className="group relative pl-8 pb-8 border-l border-border last:border-0 last:pb-0">
                                    {/* Step Number Bubble */}
                                    <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-background border-2 border-primary text-primary font-bold flex items-center justify-center text-sm shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                        {idx + 1}
                                    </div>

                                    {/* Content */}
                                    <div className="bg-muted/30 p-6 rounded-2xl hover:bg-muted/60 transition-colors">
                                        <p className="text-lg leading-relaxed text-foreground/90">
                                            {step}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-lg text-muted-foreground">
                                {/* Fallback for raw text stored in ingredients accidentally or just raw */}
                                {recipe.original_text || "No instructions available."}
                            </p>
                        )}
                    </div>
                </section>

            </div>
        </article>
    );
}
