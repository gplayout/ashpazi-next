import { supabase } from '@/lib/supabase';
import { ChefHat } from 'lucide-react';
import RecipeFeed from '@/components/RecipeFeed';
import Hero from '@/components/Hero';

// ISR: Revalidate every 1 hour
export const revalidate = 3600;

export default async function Home() {
  // Fetch initial data (Page 1)
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*, recipe_translations(*)')
    .order('created_at', { ascending: false })
    .limit(24); // Match the pagination limit

  if (error) {
    console.error("Supabase Fetch Error:", error);
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <Hero />

      {/* Recipe Feed (Infinite Scroll) */}
      <section className="container mx-auto px-4 md:px-6">
        <RecipeFeed initialRecipes={recipes || []} />
      </section>
    </main>
  );
}
