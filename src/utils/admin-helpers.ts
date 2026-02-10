export function cleanIngredientName(raw: string): string {
    if (!raw) return '';

    let text = String(raw);

    const numberRegex = /[\d\u06F0-\u06F9\u0660-\u0669]+/g;
    text = text.replace(numberRegex, '');

    const units = [
        'گرم',
        'کیلوگرم',
        'کیلو',
        'لیتر',
        'میلی لیتر',
        'میلی‌لیتر',
        'پیمانه',
        'قاشق',
        'غذاخوری',
        'چایخوری',
        'مرباخوری',
        'سوپخوری',
        'عدد',
        'حبه',
        'شاخه',
        'دسته',
        'بسته',
        'فنجان',
        'لیوان',
        'ورق',
        'مثقال',
        'سیر',
        'ملاقه',
    ];

    const tokens = text.split(/[\s\u200C]+/);
    const filtered = tokens.filter(t => !units.includes(t));
    text = filtered.join(' ');

    text = text.replace(/^[-\s:.]+|[-\s:.]+$/g, '');

    return text.trim();
}
