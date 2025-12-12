export const toPersianDigits = (n) => {
    if (n === undefined || n === null) return '';
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n.toString().replace(/\d/g, x => farsiDigits[x]);
};

export const difficultyMap = {
    'Easy': 'آسان',
    'Medium': 'متوسط',
    'Hard': 'سخت',
    'expert': 'حرفه‌ای' // fallback
};

export const categoryMap = {
    'Persian Cuisine': 'آشپزی ایرانی',
    'Appetizer': 'پیش‌غذا',
    'Main Course': 'غذای اصلی',
    'Dessert': 'دسر',
    'Drink': 'نوشیدنی',
    'Breakfast': 'صبحانه'
};
