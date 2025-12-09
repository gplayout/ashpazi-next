'use client';

import { useState, useRef } from 'react';
import { Refrigerator, Upload, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import RecipeCard from '@/components/RecipeCard';

export default function FridgePage() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
        }
    };

    const handleSubmit = async () => {
        if (!image) return;

        setLoading(true);
        setResult(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onloadend = async () => {
                const base64 = reader.result;

                const response = await fetch('/api/fridge', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64 }),
                });

                const data = await response.json();
                setResult(data);
                setLoading(false);
            };
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background pb-20">
            {/* Header */}
            <section className="relative w-full py-16 px-6 bg-gradient-to-b from-cyan-500/10 to-background flex flex-col items-center text-center space-y-4">
                <Link href="/" className="absolute top-6 left-6">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div className="p-4 bg-cyan-500/20 rounded-full mb-2">
                    <Refrigerator size={48} className="text-cyan-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                    Fridge Vision
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                    Snap a photo of your fridge and discover what you can cook!
                </p>
            </section>

            {/* Upload Section */}
            <section className="container mx-auto px-4 md:px-6 mt-8 max-w-2xl">
                <Card className="p-8 space-y-6">
                    {/* Preview or Upload Zone */}
                    <div
                        className="relative aspect-video rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                <Upload size={48} />
                                <span>Upload a photo of your fridge or ingredients</span>
                                <span className="text-sm">PNG, JPG up to 10MB</span>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={!image || loading}
                            className="flex-1 h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Scanning ingredients...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2" size={20} />
                                    Find Recipes
                                </>
                            )}
                        </Button>
                        {preview && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setImage(null);
                                    setPreview(null);
                                    setResult(null);
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Result Section */}
                {result && (
                    <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Detected Ingredients */}
                        <Card className="p-6">
                            <h3 className="text-xl font-bold mb-4">Detected Ingredients</h3>
                            <div className="flex flex-wrap gap-2">
                                {result.ingredients?.map((ing, i) => (
                                    <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                                        {ing}
                                    </Badge>
                                ))}
                            </div>
                        </Card>

                        {/* Recipe Suggestions */}
                        {result.recipes && result.recipes.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Recipes You Can Make</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {result.recipes.map((recipe) => (
                                        <RecipeCard key={recipe.id} recipe={recipe} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Matches */}
                        {(!result.recipes || result.recipes.length === 0) && (
                            <Card className="p-6 text-center text-muted-foreground">
                                <p>No exact matches found, but you have great ingredients!</p>
                                <p className="text-sm mt-2">Try adding a few more items to your fridge. 😊</p>
                            </Card>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
