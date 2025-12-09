const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaffaron.com';

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/auth/'],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
