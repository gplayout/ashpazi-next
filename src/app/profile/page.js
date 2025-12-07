import { getSavedRecipes } from '../actions/profile';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import RecipeCard from '@/components/RecipeCard';
import { User, LogOut } from 'lucide-react';

export default async function ProfilePage() {
    const supabase = await createClient(); // Ensure awaited
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const savedRecipes = await getSavedRecipes();

    // Get user initial logic (same as AuthButton for consistency)
    const userInitial = user.email?.[0].toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-background pb-20">

            {/* Profile Header */}
            <div className="bg-muted/30 border-b border-border/40">
                <div className="container mx-auto px-4 py-12 flex flex-col items-center space-y-4">
                    <div className="h-24 w-24 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200 shadow-sm">
                        <span className="text-4xl font-bold text-amber-700">{userInitial}</span>
                    </div>
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-bold">{user.user_metadata?.full_name || 'Chef'}</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Saved Recipes Grid */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <User className="text-amber-600" />
                    <span>دستور پخت‌های ذخیره شده</span>
                    <span className="text-sm font-normal text-muted-foreground mr-2">({savedRecipes.length})</span>
                </h2>

                {savedRecipes.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground text-lg mb-4">You haven't saved any recipes yet.</p>
                        <a href="/" className="text-amber-600 hover:underline">Explore Recipes</a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {savedRecipes.map((recipe) => (
                            <div key={recipe.id} className="h-full">
                                <RecipeCard recipe={recipe} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
