export default function RecipeLoading() {
    return (
        <div className="animate-pulse">
            {/* Hero image skeleton */}
            <div className="relative w-full h-[40vh] md:h-[50vh] bg-muted/60" />

            <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
                {/* Title */}
                <div className="space-y-3">
                    <div className="h-8 w-3/4 bg-muted/60 rounded" />
                    <div className="h-4 w-1/2 bg-muted/40 rounded" />
                </div>

                {/* Meta badges */}
                <div className="flex gap-3">
                    <div className="h-8 w-24 bg-muted/40 rounded-full" />
                    <div className="h-8 w-24 bg-muted/40 rounded-full" />
                    <div className="h-8 w-24 bg-muted/40 rounded-full" />
                </div>

                {/* Two-column content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Ingredients sidebar */}
                    <div className="space-y-3">
                        <div className="h-6 w-32 bg-muted/60 rounded" />
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-4 w-full bg-muted/30 rounded" />
                        ))}
                    </div>

                    {/* Instructions */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="h-6 w-36 bg-muted/60 rounded" />
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 w-full bg-muted/30 rounded" />
                                <div className="h-4 w-5/6 bg-muted/20 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
