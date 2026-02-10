export const toPersianDigits = (n: string | number | undefined | null): string => {
    if (n === undefined || n === null) return '';
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n.toString().replace(/\d/g, x => farsiDigits[Number(x)]);
};

export const difficultyMap: Record<string, string> = {
    Easy: 'آسان',
    Medium: 'متوسط',
    Hard: 'سخت',
    expert: 'حرفه‌ای',
};

export const categoryMap: Record<string, string> = {
    'Persian Cuisine': 'آشپزی ایرانی',
    Appetizer: 'پیش‌غذا',
    'Main Course': 'غذای اصلی',
    Dessert: 'دسر',
    Drink: 'نوشیدنی',
    Breakfast: 'صبحانه',
};
