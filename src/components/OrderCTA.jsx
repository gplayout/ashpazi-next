'use client';

import { useState } from 'react';

export default function OrderCTA({ offer, slug }) {
    const [loading, setLoading] = useState(false);

    if (!offer || !offer.enabled) return null;

    // Construct URL immediately
    const phone = offer.destination || "";
    const cleanPhone = phone.replace(/[^\d+]/g, '');
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

    const handleOrderClick = (e) => {
        // Do NOT prevent default. Let the link navigation happen.
        // Fire & Forget the metric
        // Use keepalive to ensure request survives page navigation (Critical for outbound links)
        fetch('/api/metrics/order-click', {
            method: 'POST',
            keepalive: true, // <--- The Fix
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slug: slug || offer.key,
                channel: offer.channel,
                sku: offer.skuLabel
            }),
        }).catch(err => console.error("Metric Log Failed", err));
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
        textDecoration: 'none', // Critical for <a>
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        transition: 'transform 0.1s active',
    };

    return (
        <div style={containerStyle}>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOrderClick}
                style={buttonStyle}
            >
                <span>🛍️ Order for Pickup</span>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.9em' }}>
                    ${offer.price}
                </span>
            </a>
        </div>
    );
}
