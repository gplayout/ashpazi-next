'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceControl = (commands = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setIsSupported(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
                console.log("Voice Command Recognized:", transcript);

                if (transcript.includes('next')) commands.next?.();
                else if (transcript.includes('back') || transcript.includes('previous')) commands.back?.();
                else if (transcript.includes('repeat')) commands.repeat?.();
                else if (transcript.includes('stop')) commands.stop?.();
            };

            recognitionRef.current = recognition;
        }
    }, [commands]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Speech recognition start failed:", e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    return { isListening, isSupported, startListening, stopListening };
};
