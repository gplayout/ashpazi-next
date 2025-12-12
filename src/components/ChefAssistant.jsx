'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Volume2, X, ChefHat, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { getUiLabel } from '@/utils/dictionaries';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChefAssistant({ recipeContext }) {
    const { language } = useLanguage();
    // States: idle, listening, processing, speaking
    const [state, setState] = useState('idle');
    const [audioResponse, setAudioResponse] = useState(null);
    const [transcript, setTranscript] = useState('');

    // Refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioPlayerRef = useRef(null);

    // Audio Visualizer Bar variants
    const barVariants = {
        idle: { height: 4 },
        active: {
            height: [8, 24, 8],
            transition: { repeat: Infinity, duration: 0.5 }
        }
    };

    const [timeLeft, setTimeLeft] = useState(30);
    const timerRef = useRef(null);

    // Unlock audio context on user interaction (Mobile Safari/Chrome fix)
    const unlockAudio = () => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.src = '';
            audioPlayerRef.current.load();
        }
    };

    const startRecording = async () => {
        unlockAudio(); // <--- CRITICAL: "Bless" the audio element immediately
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await processAudio(audioBlob);
            };

            mediaRecorderRef.current.start();
            setState('listening');
            setAudioResponse(null);

            // Start 30s countdown
            setTimeLeft(30);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error) {
            console.error('Mic Error:', error);
            alert('Microphone access denied');
        }
    };

    const stopRecording = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setState('processing');
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // State for manual playback trigger
    const [isAudioReady, setIsAudioReady] = useState(false);
    const pendingAudioBlobRef = useRef(null);

    const processAudio = async (audioBlob) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1];

                const response = await fetch('/api/assistant', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        audio: base64Audio,
                        language,
                        recipeContext: recipeContext ? {
                            title: recipeContext.title,
                            ingredients: recipeContext.ingredients,
                            instructions: recipeContext.instructions
                        } : null
                    }),
                });

                const data = await response.json();

                if (data.audio) {
                    setTranscript(data.text);

                    // --- CHANGED: Don't Auto-Play. Stage for Manual Play ---
                    // Convert to Blob immediately
                    const byteCharacters = atob(data.audio);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'audio/mpeg' });

                    pendingAudioBlobRef.current = URL.createObjectURL(blob);
                    setIsAudioReady(true); // Triggers UI Button
                    setState('speaking'); // Show visualizer (optional) or 'idle'

                } else {
                    setState('idle');
                }
            };
        } catch (error) {
            console.error('API Error:', error);
            setState('idle');
        }
    };

    const playPendingAudio = () => {
        if (!audioPlayerRef.current || !pendingAudioBlobRef.current) return;

        try {
            audioPlayerRef.current.src = pendingAudioBlobRef.current;
            audioPlayerRef.current.play()
                .then(() => {
                    console.log("✅ Manual Play Success");
                    setIsAudioReady(false); // Hide button
                    setState('speaking');
                })
                .catch(e => {
                    console.error("Manual Play Failed:", e);
                    alert("Tap again to play!");
                });
        } catch (e) {
            console.error(e);
        }
    };

    const playResponse = async (base64Audio) => {
        if (!audioPlayerRef.current) {
            console.error("❌ Audio Player Ref is NULL");
            return;
        }

        console.log(`🔊 Receiving Audio: ${base64Audio.length} chars`);

        try {
            // Convert Base64 to Blob (Better for Mobile Memory)
            const byteCharacters = atob(base64Audio);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mpeg' });
            const blobUrl = URL.createObjectURL(blob);

            console.log("🔗 Blob URL Created:", blobUrl);
            audioPlayerRef.current.src = blobUrl;

            console.log("▶️ Attempting Play...");

            // Wait for 'canplaythrough' to ensure mobile is ready
            await new Promise((resolve) => {
                audioPlayerRef.current.oncanplaythrough = resolve;
                // Timeout fallback in case event doesn't fire
                setTimeout(resolve, 1000);
            });

            const playPromise = audioPlayerRef.current.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => console.log("✅ Playback Started Successfully"))
                    .catch(error => {
                        console.error("❌ Audio Playback Failed:", error);
                        if (error.name === 'NotAllowedError') {
                            alert("Please tap anywhere to enable audio.");
                        }
                        setState('idle');
                    });
            }
        } catch (e) {
            console.error("❌ Audio Setup Critical Fail:", e);
            setState('idle');
        }
    };

    // Auto-stop recording removed to allow user to speak freely
    // User must manually click stop
    /*
    useEffect(() => {
        let timer;
        if (state === 'listening') {
            timer = setTimeout(() => stopRecording(), 8000);
        }
        return () => clearTimeout(timer);
    }, [state]);
    */

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            <AnimatePresence mode="wait">
                {state === 'idle' ? (
                    <motion.button
                        key="idle"
                        layoutId="island"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={startRecording}
                        className="group flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-lg hover:shadow-amber-500/50 transition-all hover:scale-110 active:scale-95"
                    >
                        <ChefHat className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
                        <span className="sr-only">Ask Chef</span>
                    </motion.button>
                ) : isAudioReady ? (
                    <motion.button
                        key="play"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="group flex items-center justify-center w-16 h-16 bg-green-500 rounded-full shadow-lg animate-pulse"
                        onClick={playPendingAudio}
                    >
                        <Volume2 className="w-8 h-8 text-white" />
                    </motion.button>
                ) : (
                    <motion.div
                        key="active"
                        layoutId="island"
                        initial={{ opacity: 0, borderRadius: 32 }}
                        animate={{ opacity: 1, width: 'auto', minWidth: 300 }}
                        exit={{ opacity: 0 }}
                        className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl flex flex-col gap-4 max-w-[90vw] md:max-w-md"
                    >
                        {/* Header: Chef Avatar & Status */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-inner">
                                    <ChefHat size={20} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Chef Zaffaron</h4>
                                    <div className="flex items-center gap-1.5 h-4">
                                        {/* Dynamic Status Text */}
                                        <span className="text-xs text-zinc-400 font-medium tracking-wide min-w-[60px]">
                                            {state === 'listening' ? (
                                                <span className="text-red-400 font-bold tabular-nums">
                                                    00:{timeLeft.toString().padStart(2, '0')}
                                                </span>
                                            ) : (
                                                <>
                                                    {state === 'processing' && getUiLabel('assistant_processing', language)}
                                                    {state === 'speaking' && getUiLabel('assistant_speaking', language)}
                                                </>
                                            )}
                                        </span>
                                        {/* Mini Visualizer */}
                                        {(state === 'listening' || state === 'speaking') && (
                                            <div className="flex gap-0.5 items-center h-3 ml-2">
                                                {[1, 2, 3, 4].map(i => (
                                                    <motion.div
                                                        key={i}
                                                        variants={barVariants}
                                                        animate="active"
                                                        custom={i}
                                                        className={`w-0.5 rounded-full ${state === 'listening' ? 'bg-red-500' : 'bg-amber-500'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex gap-2">
                                {state === 'listening' && (
                                    <button
                                        onClick={stopRecording}
                                        className="p-2 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors animate-pulse"
                                    >
                                        <MicOff size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setState('idle');
                                        if (audioPlayerRef.current) audioPlayerRef.current.pause();
                                    }}
                                    className="p-2 rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Transcript Bubble */}
                        {(transcript || state === 'processing') && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 rounded-2xl p-3 border border-white/5"
                            >
                                <p className="text-sm text-zinc-200 leading-relaxed font-light">
                                    {state === 'processing' ? (
                                        <span className="flex items-center gap-2">
                                            <Sparkles size={14} className="text-amber-400 animate-spin" />
                                            Checking the recipe...
                                        </span>
                                    ) : (
                                        transcript
                                    )}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
