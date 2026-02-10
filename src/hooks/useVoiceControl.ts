'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceCommands {
    next?: () => void;
    back?: () => void;
    repeat?: () => void;
    stop?: () => void;
}

interface VoiceControlReturn {
    isListening: boolean;
    isSupported: boolean;
    startListening: () => void;
    stopListening: () => void;
}

// Extend Window for WebKit Speech Recognition
interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
}

export const useVoiceControl = (
    commands: VoiceCommands = {},
    language = 'en'
): VoiceControlReturn => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<null | {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onstart: (() => void) | null;
        onend: (() => void) | null;
        onresult: ((event: SpeechRecognitionEvent) => void) | null;
        start: () => void;
        stop: () => void;
    }>(null);
    const shouldBeListening = useRef(false);

    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
        ) {
            setIsSupported(true);
            const SpeechRecognitionCtor =
                (window as unknown as Record<string, new () => typeof recognitionRef.current>)
                    .SpeechRecognition ||
                (window as unknown as Record<string, new () => typeof recognitionRef.current>)
                    .webkitSpeechRecognition;
            const recognition = new SpeechRecognitionCtor()!;

            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.lang = language === 'fa' ? 'fa-IR' : 'en-US';

            recognition.onstart = () => setIsListening(true);

            recognition.onend = () => {
                setIsListening(false);
                if (shouldBeListening.current) {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.log('Voice restart throttled:', e);
                        setTimeout(() => {
                            if (shouldBeListening.current) recognition.start();
                        }, 1000);
                    }
                }
            };

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = (
                    event.results[event.results.length - 1] as unknown as {
                        0: { transcript: string };
                    }
                )[0].transcript
                    .toLowerCase()
                    .trim();
                console.log('Voice Command:', transcript);

                if (
                    language === 'fa' ||
                    transcript.includes('بعدی') ||
                    transcript.includes('قبلی')
                ) {
                    if (
                        ['بعدی', 'بدی', 'برو', 'next', 'siguiente'].some(cmd =>
                            transcript.includes(cmd)
                        )
                    )
                        commands.next?.();
                    else if (
                        ['قبلی', 'برگرد', 'back', 'atras'].some(cmd => transcript.includes(cmd))
                    )
                        commands.back?.();
                    else if (
                        ['تکرار', 'چی', 'repeat', 'repetir'].some(cmd => transcript.includes(cmd))
                    )
                        commands.repeat?.();
                    else if (['ایست', 'بس', 'stop'].some(cmd => transcript.includes(cmd)))
                        commands.stop?.();
                } else if (language === 'es' || transcript.includes('siguiente')) {
                    if (['siguiente', 'proximo', 'next'].some(cmd => transcript.includes(cmd)))
                        commands.next?.();
                    else if (['atras', 'anterior', 'back'].some(cmd => transcript.includes(cmd)))
                        commands.back?.();
                    else if (['repetir', 'que', 'repeat'].some(cmd => transcript.includes(cmd)))
                        commands.repeat?.();
                } else {
                    if (['next', 'go', 'continue', 'forward'].some(cmd => transcript.includes(cmd)))
                        commands.next?.();
                    else if (['back', 'previous', 'return'].some(cmd => transcript.includes(cmd)))
                        commands.back?.();
                    else if (['repeat', 'again', 'say'].some(cmd => transcript.includes(cmd)))
                        commands.repeat?.();
                }
            };

            recognitionRef.current = recognition;

            if (shouldBeListening.current) {
                try {
                    recognition.start();
                } catch {
                    // ignore
                }
            }
        }
    }, [commands, language]);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            shouldBeListening.current = true;
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error('Start error:', e);
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
