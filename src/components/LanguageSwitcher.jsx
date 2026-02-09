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

import { LANGUAGES } from '@/lib/languages';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const currentLabel = LANGUAGES.find(l => l.code === language)?.name || 'Language';

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
                        <span>{lang.name}</span>
                        {language === lang.code && <Check size={14} className="ml-2 text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
