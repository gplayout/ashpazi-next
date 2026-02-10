'use client';
import React from 'react';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ShoppingBag, MapPin, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function ChefCTA({
    recipeId,
    recipeName,
}: {
    recipeId: string;
    recipeName: string;
}) {
    const [chef, setChef] = useState<{
        id: string;
        name: string;
        slug: string;
        profile_image_url: string;
        location_label: string;
        contact_method: string;
        contact_number: string;
        [k: string]: unknown;
    } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [processing, setProcessing] = useState<boolean>(false);

    // Fetch the featured chef (For MVP, we fetch the first active chef or specific one)
    useEffect(() => {
        async function loadChef(): Promise<void> {
            try {
                // HARDENING: Fetching from DB, not hardcoded.
                const { data, error } = await supabase
                    .from('chefs')
                    .select('*')
                    .eq('slug', 'maryam-banu') // MVP: Featured Chef
                    .single();

                if (data) setChef(data);
                // If error, we might fallback silently or show nothing
            } catch (e) {
                console.error('Chef load error', e);
            } finally {
                setLoading(false);
            }
        }
        loadChef();
    }, []);

    const handleOrderClick = async (): Promise<void> => {
        if (!chef) return;
        setProcessing(true);

        // 1. HARDENING: Log the Intent to DB (The "Audit Trail")
        try {
            const { error } = await supabase.from('analytics_events').insert({
                event_type: 'lead_click',
                chef_id: chef.id,
                recipe_id: recipeId,
                metadata: {
                    recipe_name: recipeName,
                    source: 'pwa_detail',
                },
            });

            if (error) console.error('Log failed', error); // Don't block user
        } catch (e) {
            console.error('Log system error', e);
        }

        // 2. LOGIC: Construct the Contact Link (WhatsApp/SMS)
        let href = '#';
        if (chef.contact_method === 'whatsapp') {
            const text = `Hi ${chef.name}, I want to order "${recipeName}". Is it available?`;
            href = `https://wa.me/${chef.contact_number}?text=${encodeURIComponent(text)}`;
        } else if (chef.contact_method === 'sms') {
            const text = `Hi ${chef.name}, I want to order "${recipeName}". context:Zaffaron`;
            href = `sms:${chef.contact_number}?body=${encodeURIComponent(text)}`;
        }

        // 3. EXECUTE: Open channel
        window.open(href, '_blank');
        setProcessing(false);
    };

    if (loading) return null; // Or skeleton
    if (!chef) return null; // No chef available for this region

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 shadow-lg my-8 relative overflow-hidden">
            {/* Header Badge */}
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                FEATURED CHEF
            </div>

            <div className="flex items-center gap-4">
                {/* Chef Image */}
                <div className="relative w-16 h-16 shrink-0">
                    <Image
                        src={chef.profile_image_url || '/chef-placeholder.jpg'}
                        alt={chef.name}
                        fill
                        className="object-cover rounded-full border-2 border-white dark:border-zinc-800 shadow-sm"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>

                {/* Chef Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-foreground truncate">{chef.name}</h3>

                    {/* HARDENING: Geo Transparency Label */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin size={12} className="text-amber-600" />
                        <span className="font-medium uppercase tracking-wide">
                            {chef.location_label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Area */}
            <div className="mt-4 flex flex-col gap-2">
                <Button
                    onClick={handleOrderClick}
                    disabled={processing}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-emerald-200 dark:shadow-none shadow-lg transition-all active:scale-[0.98]"
                >
                    {processing ? (
                        <Loader2 className="animate-spin mr-2" />
                    ) : (
                        <ShoppingBag className="mr-2" size={20} />
                    )}
                    Order Now ($15)
                </Button>
                <p className="text-[10px] text-center text-muted-foreground opacity-70">
                    By clicking, you will be connected directly to the chef using{' '}
                    {chef.contact_method}.
                </p>
            </div>
        </div>
    );
}
