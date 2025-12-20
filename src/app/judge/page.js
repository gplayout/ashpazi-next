'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Star, Loader2, ChefHat, ArrowLeft, Sparkles } from 'lucide-react';
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
        <main className="min-h-screen bg-slate-950 text-white pb-20 overflow-x-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 z-[-1]">
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] bg-yellow-600/10 rounded-full blur-[80px]" />
            </div>

            {/* Header */}
            <section className="relative w-full py-12 px-6 flex flex-col items-center text-center space-y-4 z-10">
                <Link href="/" className="absolute top-6 left-6">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-amber-400">
                        <ArrowLeft size={24} />
                    </Button>
                </Link>

                <div className="relative p-6">
                    <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
                    <div className="relative p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
                        <ChefHat size={48} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
                    {getUiLabel('judge_title', language)}
                </h1>
                <p className="text-lg text-amber-100/70 max-w-xl font-medium">
                    {getUiLabel('judge_subtitle', language)}
                </p>
            </section>

            {/* Upload Section */}
            <section className="container mx-auto px-4 md:px-6 mt-4 max-w-2xl relative z-10">
                <div className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-white/20 to-transparent">
                    <Card className="p-8 space-y-8 bg-black/40 backdrop-blur-xl border-none shadow-2xl rounded-[23px] relative overflow-hidden">

                        {loading && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-[23px]">
                                <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-4" />
                                <p className="text-amber-200 font-bold animate-pulse text-lg">{getUiLabel('analyzing', language)}...</p>
                            </div>
                        )}

                        {/* Preview or Upload Zone */}
                        <div
                            className="relative aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-black/20 flex items-center justify-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-900/10 transition-all duration-300 overflow-hidden group/upload"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-amber-100/60 group-hover/upload:text-amber-400 transition-colors">
                                    <div className="p-4 rounded-full bg-white/5 group-hover/upload:scale-110 transition-transform duration-300">
                                        <Upload size={40} />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-lg font-bold block">{getUiLabel('click_upload', language)}</span>
                                        <span className="text-xs opacity-70">PNG, JPG up to 10MB</span>
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
                                className="flex-1 h-14 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-lg shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400/20 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                            >
                                <Star className="mr-3" size={24} />
                                {getUiLabel('rate_my_dish', language)}
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
                    <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl text-center overflow-hidden">
                            {/* Confetti/Rays Background */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl" />

                            {/* Score Circle */}
                            <div className="relative z-10 mb-8 inline-block group">
                                <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                                <div className="relative w-32 h-32 rounded-full border-4 border-amber-400 bg-black/50 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                                    <span className="text-5xl font-black text-amber-400 drop-shadow-lg">{result.score}</span>
                                </div>
                                <div className="mt-2 text-sm font-bold text-amber-200 uppercase tracking-widest">Score</div>
                            </div>

                            {/* Feedback */}
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-2xl font-bold text-white mb-2 underline decoration-amber-500/50 underline-offset-4 decoration-4">
                                    {getUiLabel('chefs_feedback', language)}
                                </h3>
                                <p className="text-lg text-slate-100 leading-relaxed max-w-lg mx-auto italic">
                                    "{result.feedback}"
                                </p>

                                <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto my-6" />

                                {/* Tips */}
                                {result.tips && Array.isArray(result.tips) && result.tips.length > 0 && (
                                    <div className="text-left bg-black/20 p-6 rounded-2xl border border-white/5">
                                        <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                                            <Sparkles size={16} />
                                            {getUiLabel('tips_improvement', language)}
                                        </h4>
                                        <ul className="space-y-2">
                                            {result.tips.map((tip, i) => (
                                                <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
