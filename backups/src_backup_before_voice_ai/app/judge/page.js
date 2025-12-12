'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Star, Loader2, ChefHat, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getUiLabel } from '@/utils/dictionaries';

export default function JudgePage() {
    const { language } = useLanguage();
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
            // Convert to base64
            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onloadend = async () => {
                const base64 = reader.result;

                const response = await fetch('/api/judge', {
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

    return (
        <main className="min-h-screen bg-background pb-20">
            {/* Header */}
            <section className="relative w-full py-16 px-6 bg-gradient-to-b from-amber-500/10 to-background flex flex-col items-center text-center space-y-4">
                <Link href="/" className="absolute top-6 left-6">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div className="p-4 bg-amber-500/20 rounded-full mb-2">
                    <ChefHat size={48} className="text-amber-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                    {getUiLabel('judge_title', language)}
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                    {getUiLabel('judge_subtitle', language)}
                </p>
            </section>

            {/* Upload Section */}
            <section className="container mx-auto px-4 md:px-6 mt-8 max-w-2xl">
                <Card className="p-8 space-y-6">
                    {/* Preview or Upload Zone */}
                    <div
                        className="relative aspect-video rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center cursor-pointer hover:border-amber-500 transition-colors overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                <Upload size={48} />
                                <span>{getUiLabel('click_upload', language)}</span>
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
                            className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    {getUiLabel('analyzing', language)}
                                </>
                            ) : (
                                <>
                                    <Star className="mr-2" size={20} />
                                    {getUiLabel('rate_my_dish', language)}
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
                                {getUiLabel('clear', language)}
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Result Section */}
                {result && (
                    <Card className="mt-8 p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Score */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-4xl font-black shadow-lg">
                                {result.score}
                            </div>
                            <p className="mt-4 text-lg font-medium text-muted-foreground">out of 10</p>
                        </div>

                        {/* Feedback */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">{getUiLabel('chefs_feedback', language)}</h3>
                            <p className="text-muted-foreground leading-relaxed">{result.feedback}</p>
                        </div>

                        {/* Tips */}
                        {result.tips && result.tips.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-bold text-amber-600">{getUiLabel('tips_improvement', language)}</h4>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                    {result.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Encouragement */}
                        {result.encouragement && (
                            <p className="text-center text-lg font-medium text-amber-600 pt-4 border-t border-border">
                                {result.encouragement}
                            </p>
                        )}
                    </Card>
                )}
            </section>
        </main>
    );
}
