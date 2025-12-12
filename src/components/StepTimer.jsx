'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlarmClock } from 'lucide-react';

const StepTimer = ({ duration, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(duration * 60); // duration in minutes
    const [isActive, setIsActive] = useState(false);
    // Use a public URL or local asset for beep
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    }, []);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            audioRef.current?.play();
            if (onComplete) onComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, onComplete]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(duration * 60);
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 w-fit mt-4 animate-in fade-in zoom-in">
            <div className="flex items-center gap-2 text-2xl font-mono font-bold text-white">
                <AlarmClock size={24} className={isActive ? 'animate-pulse text-amber-500' : ''} />
                <span>{formatTime(timeLeft)}</span>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={toggleTimer}
                    className={`p-2 rounded-full transition-colors ${isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'} text-white shadow-sm`}
                >
                    {isActive ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                    onClick={resetTimer}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                    <RotateCcw size={18} />
                </button>
            </div>
        </div>
    );
};

export default StepTimer;
