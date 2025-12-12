"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, X, Send, User, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

export default function ChefAssistant({ recipeContext }) {
    const { language, t } = useLanguage();

    // UI State
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Refs for scrolling
    const scrollRef = useRef(null);

    // Initial greeting trigger
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const greeting = language === 'fa'
                ? "سلام! من سرآشپز زعفرون هستم. چطور می‌تونم کمکت کنم؟ 👨‍🍳"
                : "Hello! I'm Chef Zaffaron. How can I help you with your cooking today? 👨‍🍳";

            setMessages([{ role: 'assistant', content: greeting }]);
        }
    }, [isOpen, language]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMsg = { role: 'user', content: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    messages: messages, // Send history
                    recipeContext: recipeContext // Context awareness
                }),
            });

            const data = await response.json();

            if (data.text) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
            }

        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the kitchen server! 🍳" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-xl hover:shadow-orange-500/50 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                    >
                        <ChefHat className="w-9 h-9 text-white stroke-[1.5]" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-4 right-4 z-50 w-[calc(100vw-32px)] max-w-[350px] md:max-w-[380px] h-[60vh] md:h-[500px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-between text-white shadow-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
                                    <span className="text-xl">👨‍🍳</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Chef Zaffaron</h3>
                                    <p className="text-xs text-orange-100 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        {language === 'fa' ? 'آنلاین' : 'Online'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 scroll-smooth"
                        >
                            {messages.map((m, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={idx}
                                    className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-card border border-border text-foreground rounded-bl-none'
                                            }`}
                                    >
                                        {m.content}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start w-full">
                                    <div className="bg-card border border-border p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-background border-t border-border flex items-center gap-2">
                            <input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={language === 'fa' ? 'سوال آشپزی خود را بپرسید...' : 'Ask about cooking...'}
                                className={`flex-1 bg-muted/50 border-0 focus:ring-1 focus:ring-primary h-11 px-4 rounded-full text-sm ${language === 'fa' ? 'text-right' : 'text-left'}`}
                                dir="auto"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!inputText.trim() || isLoading}
                                size="icon"
                                className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 shrink-0 transition-all hover:scale-105"
                            >
                                <Send className="w-5 h-5 ml-0.5" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
