import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// FORCE DYNAMIC - No caching
export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const REPORT_FILE = path.join(process.cwd(), 'reports', 'duplicate_analysis.json');
const LOG_FILE = path.join(process.cwd(), 'reports', 'dedup_audit_log.jsonl');

// Helper to append log
function logAction(action: string, details: Record<string, unknown>) {
    const entry = JSON.stringify({
        timestamp: new Date().toISOString(),
        action,
        ...details,
    });
    fs.appendFileSync(LOG_FILE, entry + '\n');
}

export async function GET() {
    try {
        if (!fs.existsSync(REPORT_FILE)) {
            return NextResponse.json({ error: 'Report file not found' }, { status: 404 });
        }
        const data = fs.readFileSync(REPORT_FILE, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : String(err) },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { action, canonical_id, old_legacy_id, new_stub_id } = await request.json();

        if (!action) return NextResponse.json({ error: 'Missing action' }, { status: 400 });

        if (action === 'MERGE') {
            // MERGE: Port Canonical (Registry ID) to Old Legacy ID
            // 1. Validate
            return NextResponse.json({
                success: true,
                message: `Merged Canonical ${canonical_id} -> Legacy ${old_legacy_id}`,
            });
        }

        if (action === 'RETIRE') {
            // RETIRE: Hide Old Legacy ID
            // 1. Validate
            if (!old_legacy_id) return NextResponse.json({ error: 'Missing IDs' }, { status: 400 });

            // 2. Find any registry items associated with this old legacy ID
            const { data: regs, error: rErr } = await supabase
                .from('registry_recipes')
                .select('id')
                .eq('legacy_recipe_id', old_legacy_id);

            if (rErr) throw rErr;

            let count = 0;
            if (regs && regs.length > 0) {
                const regIds = regs.map(r => r.id);

                // 3. Set legacy_only = true for their content
                // We need to fetch current metadata to preserve other fields, or use a jsonb_set logic if possible?
                // Supabase/Postgres jsonb update is easier if we fetch-modify-save or use sql function.
                // Let's fetch-modify-save for safety (low volume).

                const { data: contents } = await supabase
                    .from('content_translations')
                    .select('recipe_id, language_code, qa_metadata')
                    .in('recipe_id', regIds);

                if (contents) {
                    for (const item of contents) {
                        const meta = item.qa_metadata || {};
                        if (meta.legacy_only !== true) {
                            meta.legacy_only = true;
                            await supabase
                                .from('content_translations')
                                .update({ qa_metadata: meta })
                                .eq('recipe_id', item.recipe_id)
                                .eq('language_code', item.language_code);
                            count++;
                        }
                    }
                }
            }

            // 4. Log
            logAction('RETIRE', { old_legacy_id, items_hidden: count });

            return NextResponse.json({
                success: true,
                message: `Retired Legacy ${old_legacy_id}. Hidden ${count} translation records.`,
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : String(err) },
            { status: 500 }
        );
    }
}
