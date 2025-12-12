import { getShoppingList } from '../actions/shopping';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ShoppingListClient from './ShoppingListClient';
import { ShoppingCart } from 'lucide-react';

export default async function ShoppingListPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const items = await getShoppingList();

    return (
        <div className="min-h-screen bg-background pb-20 font-[family-name:var(--font-vazirmatn)]">
            <div className="bg-amber-50 border-b border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-amber-800 dark:text-amber-500">
                        <ShoppingCart className="h-8 w-8" />
                        لیست خرید
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        مواد اولیه مورد نیاز برای آشپزی
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <ShoppingListClient initialItems={items} />
            </div>
        </div>
    );
}
