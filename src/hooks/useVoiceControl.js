'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceControl = (commands = {}, language = 'en') => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef(null);
    const shouldBeListening = useRef(false); // Track intent independent of browser state

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setIsSupported(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false; // We handle restart manually for better compatibility
            recognition.interimResults = false;

            // Set Language dynamically
            recognition.lang = language === 'fa' ? 'fa-IR' : 'en-US';

            recognition.onstart = () => setIsListening(true);

            recognition.onend = () => {
                setIsListening(false);
                // Auto-Restart Loop (if we still want to be listening)
                if (shouldBeListening.current) {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.log("Voice restart throttled:", e);
                        // Backoff retry in case of error loop
                        setTimeout(() => {
                            if (shouldBeListening.current) recognition.start();
                        }, 1000);
                    }
                }
            };

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
                console.log("🎤 Voice Command:", transcript);

                // Command Mapping
                // Command Mapping
                // Farsi (Broad Match)
                if (language === 'fa' || transcript.includes('بعدی') || transcript.includes('قبلی')) {
                    if (['بعدی', 'بدی', 'برو', 'next', 'siguiente'].some(cmd => transcript.includes(cmd))) commands.next?.();
                    else if (['قبلی', 'برگرد', 'back', 'atras'].some(cmd => transcript.includes(cmd))) commands.back?.();
                    else if (['تکرار', 'چی', 'repeat', 'repetir'].some(cmd => transcript.includes(cmd))) commands.repeat?.();
                    else if (['ایست', 'بس', 'stop'].some(cmd => transcript.includes(cmd))) commands.stop?.();
                }
                // Spanish
                else if (language === 'es' || transcript.includes('siguiente')) {
                    if (['siguiente', 'proximo', 'next'].some(cmd => transcript.includes(cmd))) commands.next?.();
                    else if (['atras', 'anterior', 'back'].some(cmd => transcript.includes(cmd))) commands.back?.();
                    else if (['repetir', 'que', 'repeat'].some(cmd => transcript.includes(cmd))) commands.repeat?.();
                }
                // English (Default)
                else {
                    if (['next', 'go', 'continue', 'forward'].some(cmd => transcript.includes(cmd))) commands.next?.();
                    else if (['back', 'previous', 'return'].some(cmd => transcript.includes(cmd))) commands.back?.();
                    else if (['repeat', 'again', 'say'].some(cmd => transcript.includes(cmd))) commands.repeat?.();
                }
            };

            recognitionRef.current = recognition;

            // If already listening (e.g. language switch), restart
            if (shouldBeListening.current) {
                try { recognition.start(); } catch (e) { }
            }
        }
    }, [commands, language]); // Re-init if language changes

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            shouldBeListening.current = true;
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Start error:", e);
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            shouldBeListening.current = false;
            recognitionRef.current.stop();
        }
    }, []);

    return { isListening, isSupported, startListening, stopListening };
};
