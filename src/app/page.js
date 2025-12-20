import { supabase } from '@/lib/supabase';
import { ChefHat } from 'lucide-react';
import RecipeFeed from '@/components/RecipeFeed';
import Hero from '@/components/Hero';

import Stories from '@/components/Stories';

import { fetchRecipes } from '@/app/actions';

// ISR: Force Dynamic for Debugging (0)
export const revalidate = 0;

export default async function Home() {
  // Fetch initial data (Page 1) using the shared logic
  const recipes = await fetchRecipes(1, 24);

  const error = null; // fetchRecipes handles internal errors errors returns []

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
