'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('fa');

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('language');
        if (stored && ['fa', 'en', 'es'].includes(stored)) {
            setLanguage(stored);
        }
    }, []);

    // Save to localStorage and update DOM
    useEffect(() => {
        localStorage.setItem('language', language);
        // Dynamic Direction & Language Attribute
        document.documentElement.setAttribute('dir', language === 'fa' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', language);
    }, [language]);

    // Helper to get localized content
    const t = (obj, key) => {
        if (!obj) return '';

        // 1. Try Target Language via recipe_translations
        if (obj.recipe_translations && Array.isArray(obj.recipe_translations)) {
            const translation = obj.recipe_translations.find(tr => tr.language === language);
            if (translation) {
                if (key === 'name' && translation.title) return translation.title;
                if (translation[key]) return translation[key];
            }
        }

        // 2. Legacy Specific Match (e.g. name_en for language='en')
        if (language === 'en' && obj[`${key}_en`]) {
            return obj[`${key}_en`];
        }

        // 3. Global Fallback: If target language (e.g. Spanish) is missing, show English instead of Farsi
        if (language !== 'fa') {
            // Try English Translation Row
            if (obj.recipe_translations && Array.isArray(obj.recipe_translations)) {
                const enTrans = obj.recipe_translations.find(tr => tr.language === 'en');
                if (enTrans) {
                    if (key === 'name' && enTrans.title) return enTrans.title;
                    if (enTrans[key]) return enTrans[key];
                }
            }
            // Try Legacy English Column
            if (obj[`${key}_en`]) return obj[`${key}_en`];
        }

        // 4. Final Fallback (Original Source/Farsi)
        return obj[key];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
