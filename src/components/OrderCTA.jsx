'use client';

import { useState } from 'react';

export default function OrderCTA({ offer, slug }) {
    const [loading, setLoading] = useState(false);

    if (!offer || !offer.enabled) return null;

    const handleOrderClick = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 1. Log the click (Fire & Forget mostly, but we await mainly to ensure req starts)
        try {
            await fetch('/api/metrics/order-click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: slug || offer.key,
                    channel: offer.channel,
                    sku: offer.skuLabel
                }),
            });
        } catch (err) {
            console.error("Metric Log Failed", err);
        }

        // 2. Construct URL
        const phone = offer.destination || "";
        const cleanPhone = phone.replace(/[^\d+]/g, ''); // basic sanitize
        const dateStr = new Date().toLocaleDateString('en-US');
        const text = encodeURIComponent(
            offer.message
                .replace('{{SKU}}', offer.skuLabel)
                .replace('{{DATE}}', dateStr)
        );

        let url = '#';
        if (offer.channel === 'whatsapp') {
            url = `https://wa.me/${cleanPhone}?text=${text}`;
        } else if (offer.channel === 'sms') {
            url = `sms:${cleanPhone}?body=${text}`;
        }

        // 3. Open
        window.open(url, '_blank');
        setLoading(false);
    };

    // Styles objects for cleanliness
    const containerStyle = {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '16px',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', // Safe Area
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px'
    };

    const buttonStyle = {
        backgroundColor: '#10B981', // Emerald 500
        color: 'white',
        fontWeight: '700',
        fontSize: '1.125rem',
        padding: '14px 24px',
        borderRadius: '12px',
        border: 'none',
        width: '100%',
        maxWidth: '500px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        textDecoration: 'none',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        transition: 'transform 0.1s active',
    };

    return (
        <div style={containerStyle}>
            <button
                onClick={handleOrderClick}
                style={buttonStyle}
                disabled={loading}
            >
                <span>🛍️ Order for Pickup</span>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.9em' }}>
                    ${offer.price}
                </span>
            </button>
        </div>
    );
}
