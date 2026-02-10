'use client';

import React from 'react';

interface Props {
    data: Record<string, unknown> | null;
}

export default function JsonLdScript({ data }: Props): React.ReactElement | null {
    if (!data) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
