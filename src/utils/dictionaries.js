export const ui = {
    latest_recipes: {
        fa: 'آخرین دستور پخت‌ها',
        en: 'Latest Recipes',
        es: 'Últimas Recetas'
    },
    recipes_loaded: {
        fa: 'دستور پخت',
        en: 'recipes loaded',
        es: 'recetas cargadas'
    },
    reached_end: {
        fa: 'به پایان لیست رسیدید!',
        en: "You've reached the end!",
        es: "¡Has llegado al final!"
    },
    prep_time: {
        fa: 'آماده‌سازی:',
        en: 'Prep:',
        es: 'Prep:'
    },
    cook_time: {
        fa: 'پخت:',
        en: 'Cook:',
        es: 'Cocción:'
    },
    minutes: {
        fa: 'دقیقه',
        en: 'min',
        es: 'min'
    },
    ingredients: {
        fa: 'مواد لازم',
        en: 'Ingredients',
        es: 'Ingredientes'
    },
    instructions: {
        fa: 'دستور پخت',
        en: 'Instructions',
        es: 'Instrucciones'
    },
    start_cooking: {
        fa: 'شروع آشپزی',
        en: 'Start Cooking Mode',
        es: 'Modo Cocina'
    },
    no_instructions: {
        fa: 'دستور پخت موجود نیست.',
        en: 'No instructions available.',
        es: 'Instrucciones no disponibles.'
    },
    ingredients_embedded: {
        fa: 'مواد لازم در دستور پخت ذکر شده است.',
        en: 'Ingredients are embedded in the instructions.',
        es: 'Los ingredientes están en las instrucciones.'
    },
    search_placeholder: {
        fa: 'جستجو...',
        en: 'Search...',
        es: 'Buscar...'
    },
    hero_title: {
        fa: 'زعفران',
        en: 'Zaffaron',
        es: 'Zaffaron'
    },
    hero_subtitle: {
        fa: 'جهانگردی با طعم آشپزی ایرانی',
        en: 'The world class Persian cuisine',
        es: 'La cocina persa de clase mundial'
    },
    Easy: {
        fa: 'آسان',
        en: 'Easy',
        es: 'Fácil'
    },
    Medium: {
        fa: 'متوسط',
        en: 'Medium',
        es: 'Medio'
    },
    Hard: {
        fa: 'سخت',
        en: 'Hard',
        es: 'Difícil'
    }
};

export function getUiLabel(key, lang) {
    const entry = ui[key];
    if (!entry) return key;
    return entry[lang] || entry['en'] || key;
}
