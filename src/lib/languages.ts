import type { Language } from '@/types';
import languagesJson from '../../docs/translation_languages.json';

const languages: Language[] = [...languagesJson] as Language[];

const hasEn = languages.find(l => l.code === 'en');
if (!hasEn) {
    languages.unshift({
        code: 'en',
        name: 'English',
        locale: 'en-US',
        direction: 'ltr',
    });
}

export const LANGUAGES: Language[] = languages;

export const SUPPORTED_LANG_CODES: string[] = languages.map(l => l.code);

export const RTL_LANGS: string[] = languages.filter(l => l.direction === 'rtl').map(l => l.code);
