import { supabase } from '@/lib/supabase';
import { ChefHat } from 'lucide-react';
import RecipeFeed from '@/components/RecipeFeed';

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home() {
  // Fetch initial data (Page 1)
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(24); // Match the pagination limit

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

      {/* Recipe Feed (Infinite Scroll) */}
      <section className="container mx-auto px-4 md:px-6">
        <RecipeFeed initialRecipes={recipes || []} />
      </section>
    </main>
  );
}
