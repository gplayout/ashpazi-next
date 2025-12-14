import { supabase } from '@/lib/supabase';
import { ChefHat } from 'lucide-react';
import RecipeFeed from '@/components/RecipeFeed';
import Hero from '@/components/Hero';

import Stories from '@/components/Stories';

// ISR: Force Dynamic for Debugging (0)
export const revalidate = 0;

export default async function Home() {
  // Fetch initial data (Page 1)
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*, recipe_translations(*)')
    .not('image', 'is', null) // Ensure images exist for stories
    .order('created_at', { ascending: false })
    .limit(24);

  if (error) {
    console.error("Supabase Fetch Error:", error);
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Daily Stories */}
      <Stories recipes={recipes || []} />

      {/* Hero Header */}
      <Hero />

      {/* Recipe Feed (Infinite Scroll) */}
      <section className="container mx-auto px-4 md:px-6">
        <RecipeFeed initialRecipes={recipes || []} />
      </section>
    </main>
  );
}
