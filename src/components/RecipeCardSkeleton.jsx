'use client';

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export default function RecipeCardSkeleton() {
    return (
        <Card className="overflow-hidden border border-border/40 bg-card h-full flex flex-col animate-pulse">
            {/* Image Placeholder */}
            <div className="relative aspect-[4/3] overflow-hidden w-full bg-muted/60" />

            {/* Title Placeholder */}
            <CardHeader className="p-4 pb-2 space-y-2">
                <div className="h-5 w-3/4 bg-muted/60 rounded" />
                <div className="h-5 w-1/2 bg-muted/60 rounded" />
            </CardHeader>

            {/* Description Placeholder */}
            <CardContent className="p-4 pt-1 flex-grow space-y-2">
                <div className="h-4 w-full bg-muted/40 rounded" />
                <div className="h-4 w-2/3 bg-muted/40 rounded" />
            </CardContent>

            {/* Footer Placeholder */}
            <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-border/40 mt-auto bg-muted/20">
                <div className="h-4 w-16 bg-muted/60 rounded" />
                <div className="h-4 w-16 bg-muted/60 rounded" />
            </CardFooter>
        </Card>
    );
}
