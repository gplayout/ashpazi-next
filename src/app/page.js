import { supabase } from '@/lib/supabase';
import RecipeCard from '@/components/RecipeCard';
import { ChefHat } from 'lucide-react';

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home() {
  // Fetch data on the server
  // Fetch top 50 recipes for now
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .limit(50)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase Fetch Error:", error);
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <section className="relative w-full py-20 px-6 bg-gradient-to-b from-primary/10 to-background flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-primary/20 rounded-full mb-2">
          <ChefHat size={40} className="text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
          Zaffaron
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          The World Class Persian Cooking Experience
        </p>
      </section>

      {/* Recipe Grid */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Latest Recipes</h2>
          <span className="text-sm text-muted-foreground">{recipes?.length || 0} recipes found</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes?.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        {(!recipes || recipes.length === 0) && (
          <div className="text-center py-20 text-muted-foreground">
            No recipes found. Check database connection.
          </div>
        )}
      </section>
    </main>
  );
}
