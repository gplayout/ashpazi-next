'use client';
import { useState, useEffect } from 'react';

// 🛡️ EXECUTION RULES (Hardcoded for Safety)
// Based on reports/final_dedup_checklist.md
interface ExecutionRule {
    allowMergeTo?: number[];
    retire?: number[];
    locked?: boolean;
}
interface Candidate {
    id: number;
    name: string;
    category?: string;
    confidence: string;
}
interface CurrentStub {
    legacy_id: number;
}
interface CanonicalInfo {
    id: string;
    title: string;
    source: string;
}
interface DedupGroup {
    canonical: CanonicalInfo;
    current_stub: CurrentStub;
    potential_duplicates: Candidate[];
}

const EXECUTION_RULES: Record<string, ExecutionRule> = {
    // --- MERGE ALLOWED ---
    'Thai Green Curry': { allowMergeTo: [1811], retire: [1658] }, // Batch 006 & 009 both merge to 1811. ID 1658 is an old stub to RETIRE.
    Goulash: { allowMergeTo: [1818] },
    'Green Curry': { allowMergeTo: [1811], retire: [1658] }, // Matches Thai Green Curry logic
    Köttbullar: { allowMergeTo: [1823] },
    'Butter Chicken': { allowMergeTo: [1819] },
    'Pho Bo': { allowMergeTo: [1812] },
    Carbonara: { allowMergeTo: [1821] },
    Gazpacho: { allowMergeTo: [1814] },
    Schnitzel: { allowMergeTo: [1815] },
    Laksa: { allowMergeTo: [1665] },
    Biryani: { allowMergeTo: [1776] },
    Pupusa: { allowMergeTo: [1662] },
    Okonomiyaki: { allowMergeTo: [1813] },
    Dolmades: { allowMergeTo: [1801] },
    Satay: { allowMergeTo: [1725] },
    Hummus: { allowMergeTo: [1722] },
    Bibimbap: { allowMergeTo: [1656] },
    'Osso Buco': { allowMergeTo: [1682] },
    Gumbo: { allowMergeTo: [1817] },
    Empanadas: { allowMergeTo: [1724] },
    Feijoada: { allowMergeTo: [1612] },

    // --- AMBIGUOUS RESOLVED ---
    Fondue: { allowMergeTo: [1824] }, // Verified Cheese Fondue

    // --- KEEP SEPARATE ---
    'Beef Noodle Soup': { locked: true }, // Taiwanese vs Pho
};

export default function DedupDashboard(): React.JSX.Element {
    const [report, setReport] = useState<DedupGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/admin/dedup')
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setReport(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleAction = async (
        action: string,
        canonical_id: string,
        old_legacy_id: number,
        new_stub_id: number | null
    ): Promise<void> => {
        if (!confirm(`Are you sure you want to ${action} Legacy ID ${old_legacy_id}?`)) return;

        setProcessing(old_legacy_id);
        try {
            const res = await fetch('/api/admin/dedup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, canonical_id, old_legacy_id, new_stub_id }),
            });
            const result = await res.json();
            if (result.error) throw new Error(result.error);

            alert(`Success: ${result.message}`);

            if (action === 'MERGE') {
                setReport(prev => prev.filter(g => g.canonical.id !== canonical_id));
            } else {
                setReport(prev =>
                    prev
                        .map(g => {
                            if (g.canonical.id === canonical_id) {
                                return {
                                    ...g,
                                    potential_duplicates: g.potential_duplicates.filter(
                                        c => c.id !== old_legacy_id
                                    ),
                                };
                            }
                            return g;
                        })
                        .filter(g => g.potential_duplicates.length > 0)
                );
            }
        } catch (e) {
            alert(`Error: ${(e as Error).message}`);
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="p-10 text-xl">Loading Analysis Report...</div>;
    if (error) return <div className="p-10 text-red-600">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dedup Dashboard</h1>
                    <p className="text-gray-600">
                        Phase 3.2: Resolve Legacy Duplicates (Human Governance)
                    </p>
                    <div className="mt-2 flex gap-4">
                        <div className="text-sm bg-blue-50 text-blue-800 p-2 rounded inline-block">
                            <strong>Active Conflicts:</strong> {report.length} groups
                        </div>
                        <div className="text-sm bg-green-100 text-green-800 p-2 rounded inline-block border border-green-200">
                            <strong>🛡️ EXECUTION MODE ACTIVE</strong>
                        </div>
                    </div>
                </header>

                <div className="space-y-8">
                    {report.map(group => {
                        const rules = EXECUTION_RULES[group.canonical.title] || {};
                        const isLocked = rules.locked;

                        return (
                            <div
                                key={group.canonical.id}
                                className={`rounded-lg shadow border overflow-hidden ${isLocked ? 'border-yellow-400 bg-yellow-50' : 'bg-white border-gray-200'}`}
                            >
                                {/* Header: Canonical Info */}
                                <div
                                    className={`px-6 py-4 flex justify-between items-center border-b ${isLocked ? 'bg-yellow-100' : 'bg-gray-100'}`}
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-green-700">
                                            {group.canonical.title}
                                            {isLocked && (
                                                <span className="ml-3 text-sm bg-yellow-200 text-yellow-800 px-2 py-1 rounded border border-yellow-300">
                                                    ⚠️ KEEP SEPARATE
                                                </span>
                                            )}
                                        </h3>
                                        <div className="text-sm text-gray-500 mt-1 flex gap-4">
                                            <span>
                                                Scan Source:{' '}
                                                <span className="font-mono text-gray-700">
                                                    {group.canonical.source}
                                                </span>
                                            </span>
                                            <span>
                                                Registry ID:{' '}
                                                <span className="font-mono text-gray-700">
                                                    {group.canonical.id.substring(0, 8)}...
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs uppercase text-gray-400 font-bold tracking-wider">
                                            Current Link
                                        </div>
                                        <div className="font-mono text-red-600 bg-red-50 px-2 py-1 rounded">
                                            New Stub ID: {group.current_stub.legacy_id}
                                        </div>
                                    </div>
                                </div>

                                {/* Body: Conflicts */}
                                <div className="p-6">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b text-sm text-gray-400">
                                                <th className="pb-2">
                                                    Potential Duplicate (Old Legacy)
                                                </th>
                                                <th className="pb-2">Category</th>
                                                <th className="pb-2">Confidence</th>
                                                <th className="pb-2 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.potential_duplicates.map(candidate => {
                                                const canMerge =
                                                    !isLocked &&
                                                    rules.allowMergeTo?.includes(candidate.id);
                                                const canRetire = rules.retire?.includes(
                                                    candidate.id
                                                );
                                                const isForbidden = !canMerge && !canRetire;

                                                return (
                                                    <tr
                                                        key={candidate.id}
                                                        className={`border-b last:border-0 transition-colors ${canMerge ? 'bg-green-50 hover:bg-green-100' : isForbidden ? 'opacity-50 grayscale' : 'hover:bg-yellow-50'}`}
                                                    >
                                                        <td className="py-4">
                                                            {/[\u0600-\u06FF]/.test(
                                                                candidate.name
                                                            ) ? (
                                                                <>
                                                                    <div className="font-bold text-gray-400 italic">
                                                                        [LEGACY – NON-ENGLISH NAME]
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        Original: {candidate.name}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="font-bold text-gray-800">
                                                                    {candidate.name}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-gray-400 font-mono mt-0.5">
                                                                Legacy ID: {candidate.id}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-sm text-gray-600">
                                                            {candidate.category || 'N/A'}
                                                        </td>
                                                        <td className="py-4">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    candidate.confidence.includes(
                                                                        'High'
                                                                    )
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                }`}
                                                            >
                                                                {candidate.confidence}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-right space-x-2">
                                                            {canMerge && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleAction(
                                                                            'MERGE',
                                                                            group.canonical.id,
                                                                            candidate.id,
                                                                            group.current_stub
                                                                                .legacy_id
                                                                        )
                                                                    }
                                                                    disabled={processing !== null}
                                                                    className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 shadow-sm disabled:opacity-50"
                                                                >
                                                                    ✅ MERGE TO THIS
                                                                </button>
                                                            )}

                                                            {canRetire && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleAction(
                                                                            'RETIRE',
                                                                            group.canonical.id,
                                                                            candidate.id,
                                                                            null
                                                                        )
                                                                    }
                                                                    disabled={processing !== null}
                                                                    className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded hover:bg-red-200 disabled:opacity-50"
                                                                >
                                                                    ⛔ RETIRE THIS
                                                                </button>
                                                            )}

                                                            {isForbidden && (
                                                                <span className="text-xs text-gray-400 italic">
                                                                    No Action Allowed
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}

                    {report.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                            <h3 className="text-2xl font-bold text-green-600">All Clear!</h3>
                            <p className="text-gray-500 mt-2">No duplicate conflicts found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
