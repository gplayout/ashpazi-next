/**
 * Generates a URL-friendly slug from a string.
 * Handles both English and Farsi characters.
 * 
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The generated slug
 */
export const generateSlug = (text) => {
    if (!text) return '';

    const str = text.toString().trim();

    // Check if the text contains Persian characters
    const hasPersian = /[\u0600-\u06FF]/.test(str);

    if (hasPersian) {
        // If Persian exists, keep ONLY Persian characters and spaces/dashes
        // Remove English letters, numbers, and other symbols
        return str
            .replace(/[a-zA-Z0-9]/g, '') // Remove English/Numbers
            .replace(/[^\u0600-\u06FF\s-]/g, '') // Remove other symbols but keep Persian
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    // Fallback for English-only titles
    return str
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\s-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

/**
 * Reverts a slug to a potential title (best effort, mostly for display if needed)
 * Note: This cannot perfectly restore the original title if information was lost.
 */
export const unslugify = (slug) => {
    if (!slug) return '';
    return slug.replace(/-/g, ' ');
};
