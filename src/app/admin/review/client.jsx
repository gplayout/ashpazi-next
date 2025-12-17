'use client';

import { useState } from 'react';
import { cleanIngredientName } from '@/utils/admin-helpers';
import { mapToExistingIngredient, createNewIngredient, archiveRecipe, retryRecipe } from '@/lib/admin/actions';

export default function AdminReviewClient({ recipes }) {
    const [selectedId, setSelectedId] = useState(null);
    const [actionStatus, setActionStatus] = useState('');

    const selectedRecipe = recipes.find(r => r.legacy_recipe_id === selectedId);

    // --- Handlers ---

    async function handleMapExisting(rawLine) {
        const cleaned = cleanIngredientName(rawLine || '');
        const finalName = prompt('Enter CLEAN Persian Name for mapping:', cleaned);
        if (!finalName) return;

        const existingId = prompt('Enter Existing Ingredient ID (Integer):');
        if (!existingId) return;

        try {
            await mapToExistingIngredient(finalName, parseInt(existingId, 10));
            setActionStatus(`Mapped '${finalName}' to ID ${existingId}`);
            // Auto-retry after fix? Optional. Let's stick to manual retry for safety.
        } catch (e) {
            alert(e.message);
        }
    }

    async function handleCreateNew(rawLine) {
        const cleaned = cleanIngredientName(rawLine || '');
        const finalName = prompt('Enter CLEAN Persian Name for new ingredient:', cleaned);
        if (!finalName) return;

        const code = prompt('Enter unique CODE for new ingredient (e.g. "turmeric"):');
        if (!code) return;

        try {
            const res = await createNewIngredient(code, finalName);
            setActionStatus(`Created new ingredient '${finalName}' (ID: ${res.newId})`);
        } catch (e) {
            alert(e.message);
        }
    }

    async function handleRetry(id) {
        if (!confirm('Retry this recipe?')) return;
        try {
            await retryRecipe(id);
            setActionStatus(`Retried recipe ${id}`);
        } catch (e) {
            alert(e.message);
        }
    }

    async function handleArchive(id) {
        if (!confirm('Permanently archive (ignore) this recipe?')) return;
        try {
            await archiveRecipe(id);
            setActionStatus(`Archived recipe ${id}`);
        } catch (e) {
            alert(e.message);
        }
    }

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
            {/* 1. Left Panel: Queue List */}
            <div style={{ width: '300px', borderRight: '1px solid #ccc' }}>
                <h3>Blocked Recipes ({recipes.length})</h3>
                {actionStatus && <div style={{ color: 'green' }}>{actionStatus}</div>}
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {recipes.map((r) => (
                        <li
                            key={r.legacy_recipe_id}
                            style={{
                                padding: '10px',
                                borderBottom: '1px solid #eee',
                                background: selectedId === r.legacy_recipe_id ? '#f0f0f0' : 'white',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedId(r.legacy_recipe_id)}
                        >
                            <strong>#{r.legacy_recipe_id}</strong><br />
                            {r.recipes?.name || 'Untitled'}
                        </li>
                    ))}
                </ul>
            </div>

            {/* 2. Right Panel: Detail View */}
            <div style={{ flex: 1 }}>
                {selectedRecipe ? (
                    <div>
                        <h2>Review: {selectedRecipe.recipes?.name} (#{selectedRecipe.legacy_recipe_id})</h2>

                        <div style={{ background: '#ffebee', padding: '15px', border: '1px solid #ffcdd2' }}>
                            <h3>Blocking Error</h3>
                            <pre>{JSON.stringify(selectedRecipe.error_log, null, 2)}</pre>

                            {selectedRecipe.error_log?.raw_line && (
                                <div style={{ marginTop: '10px' }}>
                                    <strong>Problematic Text:</strong><br />
                                    <code style={{ fontSize: '1.2em' }}>{selectedRecipe.error_log.raw_line}</code>
                                </div>
                            )}
                        </div>

                        <hr style={{ margin: '20px 0' }} />

                        {/* Actions Toolbar */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleMapExisting(selectedRecipe.error_log?.raw_line)}>
                                Map to Existing
                            </button>

                            <button onClick={() => handleCreateNew(selectedRecipe.error_log?.raw_line)}>
                                Create New
                            </button>

                            <div style={{ flex: 1 }}></div>

                            <button
                                onClick={() => handleRetry(selectedRecipe.legacy_recipe_id)}
                                style={{ background: 'blue', color: 'white' }}
                            >
                                Retry Processing
                            </button>

                            <button
                                onClick={() => handleArchive(selectedRecipe.legacy_recipe_id)}
                                style={{ background: 'red', color: 'white' }}
                            >
                                Archive (Ignore)
                            </button>
                        </div>

                    </div>
                ) : (
                    <p>Select a recipe from the queue to review.</p>
                )}
            </div>
        </div>
    );
}
