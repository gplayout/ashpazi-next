'use client';

import { useState, useRef } from 'react';
import { Refrigerator, Upload, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import RecipeCard from '@/components/RecipeCard';
import { useLanguage } from '@/context/LanguageContext';
import { getUiLabel } from '@/utils/dictionaries';

export default function FridgePage() {
    const { language } = useLanguage();
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    body: JSON.stringify({ image: base64, language }),
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

    // framer-motion import should be added at top if not present.
    // Since I can't see the top imports in this chunk, I will assume I need to add it or the user has it.
    // However, replace_file_content works on chunks. I will update the whole file content to be safe and ensure imports are there.
    // Wait, the file is small (177 lines). customizing the RETURN is better.

    return (
        <main className="min-h-screen bg-slate-950 text-white pb-20 overflow-x-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            {/* Header */}
            <section className="relative w-full py-12 px-6 flex flex-col items-center text-center space-y-4 z-10">
                <Link href="/" className="absolute top-6 left-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 hover:text-cyan-400"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                </Link>

                <div className="relative p-6">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                    <div className="relative p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
                        <Refrigerator
                            size={48}
                            className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-cyan-200 via-white to-cyan-200 bg-clip-text text-transparent drop-shadow-sm">
                    {getUiLabel('fridge_title', language)}
                </h1>
                <p className="text-lg text-cyan-100/70 max-w-xl font-medium">
                    {getUiLabel('fridge_subtitle', language)}
                </p>
            </section>

            {/* Upload Section */}
            <section className="container mx-auto px-4 md:px-6 mt-4 max-w-2xl relative z-10">
                <div className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-white/20 to-transparent">
                    <Card className="p-8 space-y-8 bg-black/40 backdrop-blur-xl border-none shadow-2xl rounded-[23px] relative overflow-hidden">
                        {/* Scanning Beam Animation (When Loading) */}
                        {loading && (
                            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-[23px]">
                                <div className="w-full h-[50%] bg-gradient-to-b from-cyan-500/0 via-cyan-500/10 to-cyan-500/30 border-b border-cyan-400/50 absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                            </div>
                        )}

                        {/* Preview or Upload Zone */}
                        <div
                            className="relative aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-black/20 flex items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-900/10 transition-all duration-300 overflow-hidden group/upload"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-cyan-100/60 group-hover/upload:text-cyan-400 transition-colors">
                                    <div className="p-4 rounded-full bg-white/5 group-hover/upload:scale-110 transition-transform duration-300">
                                        <Upload size={40} />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-lg font-bold block">
                                            {getUiLabel('upload_fridge', language)}
                                        </span>
                                        <span className="text-xs opacity-70">
                                            PNG, JPG up to 10MB
                                        </span>
                                    </div>
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
                                className="flex-1 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-lg shadow-[0_0_20px_rgba(8,145,178,0.4)] border border-cyan-400/20 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-3" size={24} />
                                        {getUiLabel('scanning', language)}...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-3" size={24} />
                                        {getUiLabel('find_recipes', language)}
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
                                    className="h-14 px-6 border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-red-400 rounded-xl"
                                >
                                    {getUiLabel('clear', language)}
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Result Section */}
                {result && (
                    <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Detected Ingredients */}
                        <div className="relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-cyan-300">
                                <span className="w-2 h-8 bg-cyan-500 rounded-full" />
                                {getUiLabel('detected_ingredients', language)}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {result.ingredients?.map((ing: string, i: number) => (
                                    <Badge
                                        key={i}
                                        variant="secondary"
                                        className="bg-cyan-900/30 text-cyan-200 hover:bg-cyan-900/50 border border-cyan-500/20 px-4 py-2 text-base"
                                    >
                                        {ing}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Recipe Suggestions */}
                        {result.recipes && result.recipes.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-black mb-6 text-center text-white drop-shadow-md">
                                    {getUiLabel('recipes_you_can_make', language)}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {result.recipes.map((recipe: any) => (
                                        <RecipeCard key={recipe.id} recipe={recipe} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Matches */}
                        {(!result.recipes || result.recipes.length === 0) && (
                            <div className="relative rounded-2xl bg-red-900/10 backdrop-blur-md border border-red-500/20 p-8 text-center">
                                <p className="text-red-200 text-lg font-medium">
                                    {getUiLabel('no_matches', language)}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
