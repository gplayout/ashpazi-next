import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
    const response = await updateSession(request);

    // Geo-IP Logic
    const country = request.headers.get('x-vercel-ip-country');
    let geoLang = 'fa'; // Default fallback

    if (country) {
        switch (country.toUpperCase()) {
            case 'IR':
                geoLang = 'fa';
                break;
            case 'FR':
                geoLang = 'fr';
                break;
            case 'DE':
                geoLang = 'de';
                break;
            case 'CN':
                geoLang = 'zh';
                break;
            case 'JP':
                geoLang = 'ja';
                break;
            case 'ES':
            case 'MX':
            case 'AR': // Argentina
            case 'CO':
                geoLang = 'es';
                break;
            case 'SA':
            case 'AE':
            case 'EG':
                geoLang = 'ar';
                break;
            case 'US':
            case 'GB':
            case 'CA':
            case 'AU':
                geoLang = 'en';
                break;
            default:
                geoLang = 'en'; // Default for rest of world? Or 'fa' as per original project root?
                // User said "based on user IP from any country, same country language".
                // For unknown, EN is safer international default than FA.
                break;
        }
    }

    // Pass this info to client via cookie if not already set?
    // Or just set a header for server components?
    // Setting a cookie is easiest for Client Component (LanguageContext) to read.
    // Only set if cookie missing to avoid overwriting user choice?
    // Actually LanguageContext logic will be: LocalStorage > Cookie > Default.
    // So we can always set the "Geo Hint" cookie.

    response.cookies.set('ashpazi_geo_lang', geoLang, { path: '/', maxAge: 60 * 60 * 24 }); // 1 day
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
