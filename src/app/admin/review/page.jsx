import { getBlockedRecipes } from '@/lib/admin/actions';
import AdminReviewClient from './client';

export const dynamic = 'force-dynamic';

export default async function AdminReviewPage() {
    const recipes = await getBlockedRecipes();

    return (
        <main>
            <h1 style={{ padding: '20px', background: '#333', color: 'white', margin: 0 }}>
                Pipeline Admin / Ingestion Review
            </h1>
            <AdminReviewClient recipes={recipes} />
        </main>
    );
}
