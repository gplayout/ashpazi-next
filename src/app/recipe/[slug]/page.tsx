import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildRecipeDTO } from '@/lib/recipe-dto'; // THE BUILDER
import RecipeDetailClient from '@/components/RecipeDetailClient';
import JsonLdScript from '@/components/JsonLdScript';
import { getOffer } from '@/lib/marketplace/offers';
import OrderCTA from '@/components/OrderCTA';

// ISR: revalidate every 5 minutes
export const revalidate = 300;

interface RecipePageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ lang?: string }>;
}

// SEO Metadata Generation
export async function generateMetadata({
    params,
    searchParams,
}: RecipePageProps): Promise<Metadata> {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const lang = resolvedSearchParams?.lang || 'en';

    console.log(`[RecipePage] generateMetadata slug: "${slug}" lang: "${lang}"`);

    // Use DTO Builder
    const dto = await buildRecipeDTO(slug, lang);

    if (!dto) {
        return { title: 'Recipe Not Found' };
    }

    const { content, identity, meta } = dto;
    const title = content.title;
    const desc = content.description || `Cook ${title} with Zaffaron.`;

    return {
        title: `${title} | Zaffaron Recipes`,
        description: desc.slice(0, 160),
        openGraph: {
            title: `${title} | Zaffaron`,
            description: desc.slice(0, 200),
            url: `https://zaffaron.com/recipe/${slug}`,
            images: [{ url: identity.image, width: 1200, height: 630, alt: title }],
            locale: lang === 'fa' ? 'fa_IR' : 'en_US',
            type: 'article',
        },
        alternates: {
            languages: {
                'en-US': `https://zaffaron.com/recipe/${slug}?lang=en`,
                'fa-IR': `https://zaffaron.com/recipe/${slug}?lang=fa`,
                'de-DE': `https://zaffaron.com/recipe/${slug}?lang=de`,
            },
        },
    };
}

function buildJsonLd(dto: any) {
    const { content, identity, meta } = dto;

    return {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: content.title,
        image: identity.image,
        author: { '@type': 'Organization', name: 'Zaffaron' },
        description: content.description,
        prepTime: `PT${meta.prep_time_minutes}M`,
        cookTime: `PT${meta.cook_time_minutes}M`,
        recipeYield: `${meta.servings} servings`,
        recipeIngredient: content.ingredients,
        recipeInstructions: content.instructions.map((step: string, idx: number) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            text: step,
        })),
    };
}

export default async function RecipePage({ params, searchParams }: RecipePageProps) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const { lang } = resolvedSearchParams;

    // 1. DTO BUILDER (The "Always Render" Logic)
    const dto = await buildRecipeDTO(slug, lang || 'en');

    // 2. 404 Contract: Only if Skeleton completely missing
    if (!dto) {
        notFound();
    }

    // 3. Map DTO to UI Props
    const recipeProps = {
        id: dto.identity.uuid,
        slug: dto.identity.slug, // Pass slug if needed
        name: dto.content.title,
        image: dto.identity.image,
        description: dto.content.description,
        ingredients: dto.content.ingredients,
        instructions: dto.content.instructions,
        prep_time_minutes: dto.meta.prep_time_minutes,
        cook_time_minutes: dto.meta.cook_time_minutes,
        difficulty: dto.meta.difficulty,
        servings: dto.meta.servings,
        quality_flags: dto.content.quality_flags, // UI Badge Support
        _lang: lang || 'en',
        nutrition_info: { en: {} } as Record<string, any>, // Stub
    };

    const offer = getOffer(slug);

    return (
        <>
            <JsonLdScript data={buildJsonLd(dto)} />
            {offer && <OrderCTA offer={offer} slug={slug} />}
            <RecipeDetailClient recipe={recipeProps} initialLang={lang} />
        </>
    );
}
