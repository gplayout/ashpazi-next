/**
 * Cleans a raw Persian ingredient string to extract the pure name.
 * Removes numbers, common units, and extra whitespace.
 * @param {string} raw - e.g., "۵۰۰ گرم گوشت چرخ کرده"
 * @returns {string} - e.g., "گوشت چرخ کرده"
 */
export function cleanIngredientName(raw) {
    if (!raw) return '';

    let text = String(raw);

    // 1. Remove Numbers (Persian + English + Arabic)
    const numberRegex = /[\d\u06F0-\u06F9\u0660-\u0669]+/g;
    text = text.replace(numberRegex, '');

    // 2. Remove Common Units (Simple List)
    // Note: This is context-aware removal (token based)
    const units = [
        'گرم', 'کیلوگرم', 'کیلو', 'لیتر', 'میلی لیتر', 'میلی‌لیتر',
        'پیمانه', 'قاشق', 'غذاخوری', 'چایخوری', 'مرباخوری', 'سوپخوری',
        'عدد', 'حبه', 'شاخه', 'دسته', 'بسته', 'فنجان', 'لیوان',
        'ورق', 'مثقال', 'سیر', 'ملاقه'
    ];

    // Split by space, filter out units
    // Regex handles spaces and half-spaces
    const tokens = text.split(/[\s\u200C]+/);
    const filtered = tokens.filter(t => !units.includes(t));
    text = filtered.join(' ');

    // 3. Cleanup Punctuation & Leading/Trailing special chars
    // Remove leading/trailing symbols like : - .
    text = text.replace(/^[-\s:.]+|[-\s:.]+$/g, '');

    return text.trim();
}
