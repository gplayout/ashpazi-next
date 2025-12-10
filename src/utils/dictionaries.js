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
    },
    // Search page
    difficulty: {
        fa: 'سختی',
        en: 'Difficulty',
        es: 'Dificultad'
    },
    cooking_time: {
        fa: 'زمان پخت',
        en: 'Cooking Time',
        es: 'Tiempo de cocción'
    },
    category: {
        fa: 'دسته‌بندی',
        en: 'Category',
        es: 'Categoría'
    },
    clear_filters: {
        fa: 'پاک کردن فیلترها',
        en: 'Clear Filters',
        es: 'Limpiar filtros'
    },
    found_recipes: {
        fa: 'دستور پخت پیدا شد',
        en: 'recipes found',
        es: 'recetas encontradas'
    },
    no_results: {
        fa: 'نتیجه‌ای پیدا نشد. کلمات دیگری امتحان کنید.',
        en: 'No recipes found. Try different keywords or filters.',
        es: 'No se encontraron recetas. Prueba otras palabras.'
    },
    start_typing: {
        fa: 'برای جستجو تایپ کنید...',
        en: 'Start typing to search for recipes...',
        es: 'Empieza a escribir para buscar recetas...'
    },
    time_quick: {
        fa: 'سریع (کمتر از ۳۰ دقیقه)',
        en: 'Quick (< 30 min)',
        es: 'Rápido (< 30 min)'
    },
    time_medium: {
        fa: 'متوسط (۳۰-۶۰ دقیقه)',
        en: 'Medium (30-60 min)',
        es: 'Medio (30-60 min)'
    },
    time_long: {
        fa: 'طولانی (بیش از ۶۰ دقیقه)',
        en: 'Long (> 60 min)',
        es: 'Largo (> 60 min)'
    },
    // Categories
    Rice: {
        fa: 'برنج',
        en: 'Rice',
        es: 'Arroz'
    },
    Stew: {
        fa: 'خورش',
        en: 'Stew',
        es: 'Guiso'
    },
    Kebab: {
        fa: 'کباب',
        en: 'Kebab',
        es: 'Kebab'
    },
    Soup: {
        fa: 'سوپ',
        en: 'Soup',
        es: 'Sopa'
    },
    Dessert: {
        fa: 'دسر',
        en: 'Dessert',
        es: 'Postre'
    },
    Salad: {
        fa: 'سالاد',
        en: 'Salad',
        es: 'Ensalada'
    },
    Appetizer: {
        fa: 'پیش‌غذا',
        en: 'Appetizer',
        es: 'Aperitivo'
    }
};

export function getUiLabel(key, lang) {
    const entry = ui[key];
    if (!entry) return key;
    return entry[lang] || entry['en'] || key;
}
