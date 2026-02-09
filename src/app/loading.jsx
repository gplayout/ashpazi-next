import RecipeCardSkeleton from '@/components/RecipeCardSkeleton';

export default function HomeLoading() {
    return (
        <section className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="h-7 w-40 bg-muted/60 rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted/40 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <RecipeCardSkeleton key={i} />
                ))}
            </div>
        </section>
    );
}
