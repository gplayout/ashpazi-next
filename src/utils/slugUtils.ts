export const generateSlug = (text: string): string => {
    if (!text) return '';

    const str = text.toString().trim();

    const hasPersian = /[\u0600-\u06FF]/.test(str);

    if (hasPersian) {
        return str
            .replace(/[a-zA-Z0-9]/g, '')
            .replace(/[^\u0600-\u06FF\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    return str
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\s-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

export const unslugify = (slug: string): string => {
    if (!slug) return '';
    return slug.replace(/-/g, ' ');
};
