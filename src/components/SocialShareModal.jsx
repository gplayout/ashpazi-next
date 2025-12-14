
'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { X, Share2, Download, Instagram } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function SocialShareModal({ isOpen, onClose, recipe }) {
    const cardRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [proxyImage, setProxyImage] = useState(null);

    // Pre-load image as Local Blob via Proxy to guarantee success
    React.useEffect(() => {
        if (isOpen && recipe?.image) {
            let active = true;
            const fetchImage = async () => {
                try {
                    // Fetch via our Proxy to get a clean Blob
                    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(recipe.image)}`;
                    const response = await fetch(proxyUrl);
                    if (!response.ok) throw new Error(`Proxy error: ${response.status}`);

                    const blob = await response.blob();
                    const localUrl = URL.createObjectURL(blob);

                    if (active) setProxyImage(localUrl);
                } catch (e) {
                    console.error("Failed to load image via proxy:", e);
                    // Fallback to original (might fail with tainted canvas, but html-to-image handles it better)
                    if (active) setProxyImage(recipe.image);
                }
            };
            fetchImage();
            return () => {
                active = false;
                if (proxyImage && proxyImage.startsWith('blob:')) URL.revokeObjectURL(proxyImage);
            };
        }
    }, [isOpen, recipe]);

    if (!isOpen || !recipe) return null;

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            // Using html-to-image instead of html2canvas because it handles modern CSS (like oklch) 
            // much better, relying on browser SVG foreignObject rendering.
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                skipAutoScale: true,
                quality: 0.95,
                backgroundColor: 'rgba(0,0,0,0)', // Clean transparent bg
            });

            const link = document.createElement('a');
            link.download = `zaffaron-recipe-${recipe.id}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Card generation failed:", err);
            // Fallback message with detail
            alert("Failed to create image: " + (err.message || "Unknown error"));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-background rounded-3xl w-full max-w-md overflow-hidden relative border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-border">
                    <h3 className="font-bold flex items-center gap-2">
                        <Share2 size={18} className="text-amber-500" />
                        Share Recipe
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col items-center gap-4">
                    {/* The Card (Visible Preview + Capture Target) */}
                    <div
                        ref={cardRef}
                        className="relative w-[300px] h-[533px] bg-black rounded-xl overflow-hidden shadow-2xl shrink-0"
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            {/* Use Pre-fetched Blob URL for perfect safety */}
                            <img
                                src={proxyImage || recipe.image}
                                alt={recipe.name_en}
                                className="w-full h-full object-cover opacity-80"
                                crossOrigin="anonymous"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                        </div>

                        {/* Text Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white flex flex-col items-center text-center">
                            <div className="mb-2 uppercase tracking-widest text-xs font-bold text-amber-500">
                                I Cooked This
                            </div>
                            <h2 className="text-2xl font-black leading-tight mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                {recipe.name_en}
                            </h2>

                            {/* Stats */}
                            <div className="flex gap-4 mb-8 text-sm font-medium opacity-90">
                                <span>⏱️ {recipe.prep_time_minutes}m</span>
                                <span>🔥 {recipe.nutrition_info?.caloric_balance?.calories || 'Healthy'}</span>
                            </div>

                            {/* Branding */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs">Z</span>
                                <span className="font-bold text-lg tracking-tight">Zaffaron</span>
                            </div>
                            <span className="text-[10px] opacity-60">zaffaron.com</span>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                        Share this story on Instagram or save it to your gallery.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="flex-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            {isGenerating ? 'Generating...' : (
                                <>
                                    <Instagram size={20} />
                                    <span>Download Story</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
