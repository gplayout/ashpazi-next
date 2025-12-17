'use client';

import { useState } from 'react';
import { publishTranslation } from '@/lib/admin/actions';

export default function TranslationReviewClient({ drafts }) {
    const [list, setList] = useState(drafts || []);

    async function handlePublish(id, title) {
        if (!confirm(`Publish translation for: ${title}?`)) return;
        try {
            await publishTranslation(id);
            setList(list.filter(item => item.id !== id));
            alert(`Published: ${title}`);
        } catch (e) {
            alert(e.message);
        }
    }

    if (list.length === 0) {
        return <p style={{ padding: '20px' }}>No drafts pending review.</p>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Translation Review (Drafts)</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ background: '#eee', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Lang</th>
                        <th style={{ padding: '10px' }}>Title</th>
                        <th style={{ padding: '10px' }}>Source ID</th>
                        <th style={{ padding: '10px' }}>Last Updated</th>
                        <th style={{ padding: '10px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{item.language_code.toUpperCase()}</td>
                            <td style={{ padding: '10px' }}>{item.title}</td>
                            <td style={{ padding: '10px' }}>#{item.registry_recipes?.legacy_recipe_id}</td>
                            <td style={{ padding: '10px' }}>{new Date(item.last_updated).toLocaleString()}</td>
                            <td style={{ padding: '10px' }}>
                                <button
                                    onClick={() => handlePublish(item.id, item.title)}
                                    style={{ background: 'green', color: 'white', padding: '5px 10px', border: 'none', cursor: 'pointer' }}
                                >
                                    Publish
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
