'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Mic, MicOff, Smartphone, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useVoiceControl } from '@/hooks/useVoiceControl';
import StepTimer from './StepTimer';

const CookingMode = ({ recipe, onClose }) => {
    const { t, language } = useLanguage();
    const [currentStep, setCurrentStep] = useState(0);
    const [showControls, setShowControls] = useState(true);

    // Parse instructions
    const rawInstructions = t(recipe, 'instructions') || [];
    const steps = Array.isArray(rawInstructions) ? rawInstructions : [];

    const handleNext = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, steps.length]);

    const handlePrev = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleRepeat = useCallback(() => {
        const text = steps[currentStep];
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'fa' ? 'fa-IR' : 'en-US';
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    }, [currentStep, steps, language]);

    // Voice Control
    const commands = {
        'next': handleNext,
        'back': handlePrev,
        'previous': handlePrev,
        'repeat': handleRepeat,
        'stop': () => typeof window !== 'undefined' && window.speechSynthesis.cancel()
    };

    const { isListening, isSupported, startListening, stopListening } = useVoiceControl(commands);

    // Auto-Timer Detection (Simple regex for 10 min, 5 minutes etc)
    const timeRegex = language === 'fa'
        ? /(\d+)\s*(دقیقه)/
        : /(\d+)\s*(minute|min|minutes|mins)/i;

    // Note: Farsi regex simplistic, might need enhancement for Persian digits

    const match = steps[currentStep] ? steps[currentStep].match(timeRegex) : null;
    const detectedTime = match ? parseInt(match[1]) : null;

    // Wake Lock
    useEffect(() => {
        let wakeLock = null;
        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await navigator.wakeLock.request('screen');
                    console.log('Wake Lock active');
                }
            } catch (err) {
                console.error('Wake Lock error:', err);
            }
        };
        requestWakeLock();

        // Re-acquire on visibility change
        const handleVisibilityValues = async () => {
            if (document.visibilityState === 'visible') await requestWakeLock();
        };
        document.addEventListener('visibilitychange', handleVisibilityValues);

        return () => {
            wakeLock?.release();
            document.removeEventListener('visibilitychange', handleVisibilityValues);
        };
    }, []);

    // Auto-hide controls
    useEffect(() => {
        let timeout;
        const resetControls = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 3000);
        };

        window.addEventListener('mousemove', resetControls);
        window.addEventListener('touchstart', resetControls);
        resetControls();

        return () => {
            window.removeEventListener('mousemove', resetControls);
            window.removeEventListener('touchstart', resetControls);
            clearTimeout(timeout);
        };
    }, []);

    if (steps.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-in fade-in duration-300">
            {/* Progress Bar */}
            <div className="h-1.5 bg-gray-800 w-full">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
            </div>

            {/* Header */}
            <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="text-sm font-bold text-primary">Step {currentStep + 1}</span>
                    <span className="text-xs text-gray-400">/ {steps.length}</span>
                </div>

                <div className="flex gap-2">
                    {isSupported && (
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`p-3 rounded-full backdrop-blur-md transition-colors ${isListening ? 'bg-red-500/80 animate-pulse' : 'bg-black/40 hover:bg-black/60 border border-white/10'}`}
                        >
                            {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors border border-white/10"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
                <div className="max-w-2xl bg-black/20 p-6 rounded-3xl backdrop-blur-sm">
                    <h2 className="text-2xl md:text-4xl font-bold leading-relaxed tracking-tight" dir={language === 'fa' ? 'rtl' : 'ltr'}>
                        {steps[currentStep]}
                    </h2>

                    {/* Auto-Timer */}
                    {detectedTime && (
                        <div className="flex justify-center mt-8">
                            <StepTimer duration={detectedTime} />
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className={`absolute bottom-0 left-0 right-0 p-8 flex justify-between items-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="p-5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 backdrop-blur-md"
                >
                    <ChevronLeft size={32} />
                </button>

                <button
                    onClick={handleRepeat}
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
                >
                    <RotateCcw size={24} />
                    <span className="text-xs">Repeat</span>
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentStep === steps.length - 1}
                    className="p-5 rounded-full bg-primary hover:bg-primary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-primary/20 text-black"
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            {/* Gesture Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-xs flex items-center gap-1 pointer-events-none">
                <Smartphone size={12} />
                <span>Swipe or Tap arrows</span>
            </div>
        </div>
    );
};

export default CookingMode;
