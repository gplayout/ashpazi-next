'use client';

import { useState, useRef } from 'react';
import { publishTranslation } from '@/lib/admin/actions';

interface TranslationDraft {
    id: string;
    language_code: string;
    title: string;
    publish_status: string;
    last_updated: string;
    [key: string]: unknown;
}
interface TranslationStats {
    total: number;
    byLang: Record<string, number>;
}
interface BatchSummary {
    success: number;
    skipped: number;
    failed: number;
}
interface TranslationReviewClientProps {
    drafts: TranslationDraft[];
    initialStats: TranslationStats | null;
}

export default function TranslationReviewClient({
    drafts,
    initialStats,
}: TranslationReviewClientProps): React.JSX.Element {
    const [list, setList] = useState<TranslationDraft[]>(drafts || []);
    const [selectedLang, setSelectedLang] = useState('fr');
    const [isBatching, setIsBatching] = useState(false);
    const [batchResult, setBatchResult] = useState<BatchSummary | null>(null);

    const [isAuto, setIsAuto] = useState(false);
    const [totalStats, setTotalStats] = useState({ success: 0, skipped: 0, failed: 0 });
    const stopRef = useRef<boolean>(false);

    const LANGUAGES = [
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'es', name: 'Spanish' },
        { code: 'ar', name: 'Arabic' },
        { code: 'ja', name: 'Japanese' },
        { code: 'zh', name: 'Chinese' },
        { code: 'fa', name: 'Persian' },
    ];

    async function handlePublish(id: string, title: string): Promise<void> {
        if (!confirm(`Publish translation for: ${title}?`)) return;
        try {
            await publishTranslation(parseInt(id));
            setList(list.filter(item => item.id !== id));
            alert(`Published: ${title}`);
        } catch (e) {
            alert((e as Error).message);
        }
    }

    const [isStopping, setIsStopping] = useState(false);

    const [offset, setOffset] = useState<number>(0);

    const [currentAction, setCurrentAction] = useState('Idle');

    async function handleBatchTranslation(continuous: boolean = false): Promise<void> {
        if (isBatching) return;
        setIsBatching(true);
        setIsStopping(false);
        setCurrentAction('Starting...');

        // Reset offset if starting fresh auto-run, or keep it?
        // Better to start from 0 on new run unless we want to resume?
        // Let's start from 0 for consistency, the API will skip done ones effectively via offset eventually
        // actually offset logic in API is blindly "page N", so if we start from 0 it will check 0-5.
        // If 0-5 is done (status=translated), API returns skipped/success count.
        // So iterating from 0 is correct.
        let currentOffset = 0;

        if (continuous) {
            setIsAuto(true);
            stopRef.current = false;
            setTotalStats({ success: 0, skipped: 0, failed: 0 });
        }
        setBatchResult(null);

        async function step(): Promise<void> {
            if (stopRef.current) {
                setIsBatching(false);
                setIsAuto(false);
                setIsStopping(false);
                setCurrentAction('Stopped by user.');
                return;
            }

            try {
                // Use the new robust API with offset
                // Note: process.env.NEXT_PUBLIC_PIPELINE_SECRET must be available in build.
                // If it's missing, use a hardcoded safe fallback for dev.
                const secret = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';
                setCurrentAction(`Fetching offset ${currentOffset}...`);

                const res = await fetch(
                    `/api/pipeline/translate?secret=${secret}&lang=${selectedLang}&offset=${currentOffset}`
                );

                if (!res.ok) {
                    // If error, maybe skip simple batch
                    console.error('Batch failed, skipping...');
                    setCurrentAction(
                        `Error ${res.status}. Retrying offset ${currentOffset + 5}...`
                    );
                    currentOffset += 5;
                    if (continuous && !stopRef.current) setTimeout(step, 2000);
                    else {
                        setIsBatching(false);
                        setIsAuto(false);
                        setIsStopping(false);
                    }
                    return;
                }

                const data = await res.json();

                if (data.ok) {
                    // Check for End of DB conditions
                    if (data.message === 'No normalized recipes found' || currentOffset > 3500) {
                        // Increased limit
                        alert(
                            'All caught up! No more recipes to translate (or end of DB reached).'
                        );
                        setCurrentAction('Done (End of DB).');
                        setIsBatching(false);
                        setIsAuto(false);
                        return;
                    }

                    const summary: BatchSummary = data.summary;
                    setBatchResult(summary);

                    if (continuous) {
                        setTotalStats(prev => ({
                            success: prev.success + summary.success,
                            skipped: prev.skipped + summary.skipped,
                            failed: prev.failed + summary.failed,
                        }));
                        setCurrentAction(
                            `Batch ok: ${summary.success} success, ${summary.skipped} skipped. Next...`
                        );
                    }

                    // Always increment offset to move forward, regardless of result
                    currentOffset += 5;

                    if (continuous && !stopRef.current) {
                        setTimeout(step, 500);
                    } else {
                        setIsBatching(false);
                        setIsAuto(false);
                        setIsStopping(false);
                        setCurrentAction('Single batch complete.');
                    }
                } else {
                    alert('Batch failed: ' + data.error);
                    setCurrentAction('Failed: ' + data.error);
                    setIsBatching(false);
                    setIsAuto(false);
                }
            } catch (e) {
                // If stopped during fetch, ignore error
                if (stopRef.current) return;
                console.error('Batch error:', e);
                // Retry same step or skip? Let's skip to be robust
                setCurrentAction(`Network Error. Retrying offset ${currentOffset + 5}...`);
                currentOffset += 5;
                if (continuous)
                    setTimeout(step, 2000); // Retry logic
                else {
                    setIsBatching(false);
                    setIsAuto(false);
                }
            }
        }

        step();
    }

    function stopAuto(): void {
        stopRef.current = true;
        setIsStopping(true); // Immediate UI feedback
    }

    if (list.length === 0 && !batchResult && !isBatching) {
        // Even if empty, show controls
    }

    return (
        <div style={{ padding: '20px' }}>
            {/* Batch Controls */}
            <div
                style={{
                    padding: '20px',
                    background: '#f5f5f5',
                    marginBottom: '30px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                }}
            >
                <h2 style={{ marginTop: 0 }}>Batch Translation Tool</h2>
                {initialStats && (
                    <div
                        style={{
                            marginBottom: '15px',
                            padding: '10px',
                            background: '#e0f2fe',
                            borderRadius: '4px',
                        }}
                    >
                        <strong>Database Total: {initialStats.total} translations.</strong>
                        <div style={{ fontSize: '0.9em', color: '#555', marginTop: '5px' }}>
                            {Object.entries(initialStats.byLang).map(([k, v]) => (
                                <span key={k} style={{ marginRight: '10px' }}>
                                    {k.toUpperCase()}: {v}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                <p style={{ marginBottom: '15px' }}>
                    Generate translations for missing content in the selected language.
                </p>

                <div
                    style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}
                >
                    <select
                        value={selectedLang}
                        onChange={e => setSelectedLang(e.target.value)}
                        disabled={isBatching}
                        style={{ padding: '10px', fontSize: '16px', borderRadius: '4px' }}
                    >
                        {LANGUAGES.map(l => (
                            <option key={l.code} value={l.code}>
                                {l.name} ({l.code})
                            </option>
                        ))}
                    </select>

                    {/* Single Run Button */}
                    <button
                        onClick={() => handleBatchTranslation(false)}
                        disabled={isBatching}
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            background: isBatching ? '#ccc' : '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isBatching ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Run 1 Batch (5 items)
                    </button>

                    {/* Auto Run Button */}
                    {!isAuto ? (
                        <button
                            onClick={() => handleBatchTranslation(true)}
                            disabled={isBatching}
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                background: isBatching ? '#ccc' : '#059669', // Green
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isBatching ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            🚀 Auto-Run (Full DB)
                        </button>
                    ) : (
                        <button
                            onClick={stopAuto}
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                background: isStopping ? '#991b1b' : '#dc2626', // Darker red on stopping
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isStopping ? 'wait' : 'pointer',
                            }}
                            disabled={isStopping}
                        >
                            {isStopping ? 'Stopping...' : '⏹ Stop Auto-Run'}
                        </button>
                    )}
                </div>

                {/* Progress Indicator */}
                {isAuto && (
                    <div
                        style={{
                            marginTop: '15px',
                            padding: '10px',
                            background: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                    >
                        <strong>Auto-Run Progress:</strong>
                        <span style={{ marginLeft: '15px', color: 'green' }}>
                            Success: {totalStats.success}
                        </span>
                        <span style={{ marginLeft: '15px', color: '#d97706' }}>
                            Skipped: {totalStats.skipped}
                        </span>
                        <span style={{ marginLeft: '15px', color: 'red' }}>
                            Failed: {totalStats.failed}
                        </span>
                        <div
                            style={{
                                marginTop: '10px',
                                fontSize: '14px',
                                color: '#555',
                                fontFamily: 'monospace',
                            }}
                        >
                            STATUS: {currentAction}
                        </div>
                    </div>
                )}

                {/* Last Batch Result */}
                {batchResult && !isAuto && (
                    <div
                        style={{
                            marginTop: '20px',
                            padding: '15px',
                            background: '#e0f2fe',
                            borderRadius: '4px',
                            border: '1px solid #bae6fd',
                        }}
                    >
                        <strong>Last Batch Analysis:</strong>
                        <ul style={{ margin: '10px 0 0 20px' }}>
                            <li>Success: {batchResult.success}</li>
                            <li>Skipped (Already Exists): {batchResult.skipped}</li>
                            <li>Failed: {batchResult.failed}</li>
                        </ul>
                    </div>
                )}
            </div>

            <h2>Recent Activity (Last 50 Updates)</h2>
            {list.length === 0 ? (
                <p>No recent activity found.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ background: '#eee', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Lang</th>
                            <th style={{ padding: '10px' }}>Title</th>
                            <th style={{ padding: '10px' }}>Status</th>
                            <th style={{ padding: '10px' }}>Last Updated</th>
                            <th style={{ padding: '10px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px' }}>
                                    {item.language_code.toUpperCase()}
                                </td>
                                <td style={{ padding: '10px' }}>{item.title}</td>
                                <td style={{ padding: '10px' }}>
                                    <span
                                        style={{
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background:
                                                item.publish_status === 'published'
                                                    ? '#dcfce7'
                                                    : '#fef9c3',
                                            color:
                                                item.publish_status === 'published'
                                                    ? '#166534'
                                                    : '#854d0e',
                                            fontSize: '12px',
                                        }}
                                    >
                                        {item.publish_status}
                                    </span>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    {new Date(item.last_updated).toLocaleString()}
                                </td>
                                <td style={{ padding: '10px' }}>
                                    {item.publish_status === 'draft' && (
                                        <button
                                            onClick={() => handlePublish(item.id, item.title)}
                                            style={{
                                                background: 'green',
                                                color: 'white',
                                                padding: '5px 10px',
                                                border: 'none',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Publish
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
