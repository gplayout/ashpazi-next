// === Language ===
export type LangCode =
    | 'en'
    | 'fa'
    | 'de'
    | 'fr'
    | 'es'
    | 'it'
    | 'pt'
    | 'tr'
    | 'ar'
    | 'ru'
    | 'zh'
    | 'ja'
    | 'ko'
    | 'hi';

export type Direction = 'ltr' | 'rtl';

export interface Language {
    code: string;
    name: string;
    locale: string;
    direction: Direction;
}

// === Recipe (Feed Card) ===
export interface FeedCardProps {
    title: string;
    image: string;
    time: number;
    difficulty: string;
    category?: string;
    slug?: string;
}

export interface FeedRecipe {
    id: string;
    name: string;
    image: string;
    slug?: string;
    prep_time_minutes: number;
    cook_time_minutes?: number;
    difficulty: string;
    category?: string;
    servings?: number;
    ingredients?: string[];
    instructions?: string[];
    description?: string;
    registry_id: string | null;
    recipe_translations?: RecipeTranslation[];
    nutrition_info?: Record<string, NutritionLangData>;
    _source: 'manifest' | 'legacy';
    [key: string]: unknown;
}

// === Recipe (Detail DTO — from recipe-dto.js) ===
export interface RecipeDTO {
    identity: {
        uuid: string;
        slug: string;
        image: string;
        lang: string;
        is_fallback: boolean;
    };
    meta: {
        prep_time_minutes: number;
        cook_time_minutes: number;
        servings: number;
        difficulty: string;
        taxonomy: Record<string, unknown>;
    };
    content: {
        title: string;
        description: string;
        ingredients: string[];
        instructions: string[];
        quality_flags: string[];
    };
}

// === Recipe (Frontend Props — from data.js) ===
export interface RecipeProps {
    id: string;
    legacy_id?: string | number | null;
    slug?: string;
    name: string;
    image: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prep_time_minutes: number;
    cook_time_minutes: number;
    difficulty: string;
    servings?: number;
    category?: string;
    quality_flags?: string[];
    _lang: string;
    _source?: string;
    nutrition_info: Record<string, NutritionLangData>;
    recipe_translations?: RecipeTranslation[];
}

// === Nutrition Info (per-language block) ===
export interface NutritionLangData {
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    times: { prep: number; cook: number };
    difficulty_level: string;
    category: string;
    nutrition: {
        calories: number;
        protein: string;
        carbs: string;
        fat: string;
    };
    internal_score?: number;
    chef_swaps?: string;
    origin_history?: string;
    marketing_description?: string;
    flavor_profile?: string;
    sensory_experience?: string;
    chef_guide?: unknown;
    [key: string]: unknown;
}

// === Translation ===
export interface RecipeTranslation {
    language_code: string;
    title?: string;
    description?: string;
    ingredients?: string[] | Record<string, { label?: string; text?: string }>;
    instructions?: string[] | Record<string, string | { instruction?: string; text?: string }>;
    steps?: Record<string, string>;
    seo_meta_description?: string;
    qa_metadata?: {
        marketing_description?: string;
        seo_meta_description?: string;
        category?: string;
        internal_score?: number;
        chef_swaps?: string;
        origin_history?: string;
        flavor_profile?: string;
        sensory_experience?: string;
        chef_guide?: unknown;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

// === Rate Limiter ===
export interface RateLimitConfig {
    interval: number;
    maxRequests: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
}

export interface RateLimiter {
    check: (ip: string) => RateLimitResult;
}

// === Marketplace ===
export interface Offer {
    key: string;
    enabled: boolean;
    price: number;
    currency: string;
    channel: string;
    destination: string;
    message: string;
    skuLabel: string;
}

// === Language Context ===
export interface LanguageContextValue {
    language: string;
    setLanguage: (lang: string) => void;
    t: (obj: Record<string, unknown>, key: string) => unknown;
}
