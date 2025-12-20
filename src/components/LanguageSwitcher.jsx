'use client';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'fa', label: 'فارسی (Farsi)' },
    { code: 'es', label: 'Español (Spanish)' },
    { code: 'fr', label: 'Français (French)' },
    { code: 'de', label: 'Deutsch (German)' },
    { code: 'ar', label: 'العربية (Arabic)' },
    { code: 'zh', label: '中文 (Chinese)' },
    { code: 'ja', label: '日本語 (Japanese)' },
];

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const currentLabel = LANGUAGES.find(l => l.code === language)?.label || 'Language';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 font-bold">
                    <Globe size={16} />
                    <span className="hidden md:inline">{currentLabel.split(' ')[0]}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className="flex justify-between items-center cursor-pointer"
                    >
                        <span>{lang.label}</span>
                        {language === lang.code && <Check size={14} className="ml-2 text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
