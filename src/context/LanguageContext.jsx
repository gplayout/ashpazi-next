'use client';
import { createContext, useContext, useState, useEffect } from 'react';

import { SUPPORTED_LANG_CODES, RTL_LANGS } from '@/lib/languages';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en');

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('language');

        // Check for specific valid supported langs
        const supported = SUPPORTED_LANG_CODES;

        if (stored && supported.includes(stored)) {
            setLanguage(stored);
        }
    }, []);

    // Save to localStorage and update DOM
    useEffect(() => {
        localStorage.setItem('language', language);
        // Dynamic Direction & Language Attribute
        // Add 'ar' to RTL list
        const isRtl = RTL_LANGS.includes(language);
        document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', language);

        // Optional: Toggle font class on body for better typography
        if (isRtl) {
            document.body.classList.add('font-[family-name:var(--font-vazirmatn)]');
            document.body.classList.remove('font-sans');
        } else {
            document.body.classList.add('font-sans');
            document.body.classList.remove('font-[family-name:var(--font-vazirmatn)]');
        }
    }, [language]);

    // Helper to get localized content
    const t = (obj, key) => {
        if (!obj) return '';

        // 0. Priority: AI-Generated Content (nutrition_info JSON)
        if (obj.nutrition_info) {
            const langCode = language;
            // Map legacy verbal keys if necessary, but prefer strict code match
            const node = obj.nutrition_info[langCode] ||
                (langCode === 'en' ? obj.nutrition_info.english :
                    langCode === 'fa' ? obj.nutrition_info.persian :
                        langCode === 'es' ? obj.nutrition_info.spanish : null);

            if (node) {
                if (node[key]) return node[key];
            }
        }

        // 1. Try Target Language via recipe_translations
        if (obj.recipe_translations && Array.isArray(obj.recipe_translations)) {
            const translation = obj.recipe_translations.find(tr => tr.language_code === language);
            if (translation) {
                if (key === 'name' && translation.title) return translation.title;
                if (translation[key]) return translation[key];
            }
        }

        // 2. Legacy Specific Match (e.g. name_fr for language='fr') - Generic Fallback
        if (obj[`${key}_${language}`]) {
            return obj[`${key}_${language}`];
        }

        // 3. Global Fallback to English
        if (language !== 'en') {
            // Try English Translation Row
            if (obj.recipe_translations && Array.isArray(obj.recipe_translations)) {
                const enTrans = obj.recipe_translations.find(tr => tr.language_code === 'en');
                if (enTrans) {
                    if (key === 'name' && enTrans.title) return enTrans.title;
                    if (enTrans[key]) return enTrans[key];
                }
            }
            // Try Legacy English Column
            if (obj[`${key}_en`]) return obj[`${key}_en`];
        }

        // 4. Final Fallback (Original Source/Default)
        return obj[key];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
