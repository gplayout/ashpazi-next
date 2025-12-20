import { getRecentTranslations, getTranslationStats } from '@/lib/admin/actions';
import TranslationReviewClient from './client';

export const dynamic = 'force-dynamic';

export default async function TranslationReviewPage() {
    const drafts = await getRecentTranslations();
    const stats = await getTranslationStats();

    return (
        <main>
            <h1 style={{ padding: '20px', background: '#444', color: 'white', margin: 0 }}>
                Translation Publishing Queue
            </h1>
            <TranslationReviewClient drafts={drafts} initialStats={stats} />
        </main>
    );
}

