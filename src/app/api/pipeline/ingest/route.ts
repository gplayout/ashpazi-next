import { type NextRequest, NextResponse } from 'next/server';
import { pipelineClient } from '@/lib/pipeline-client';
import { IngestionAgent } from '@/lib/pipeline/ingestion-agent';

export const dynamic = 'force-dynamic'; // Prevent static caching

export async function GET(request: NextRequest) {
    try {
        // 1. Auth Check
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== process.env.NEXT_PUBLIC_PIPELINE_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Pending Rows (Limit 25 per batch)
        // Pipeline strictly processes 'new' or 'manual_retry'
        const { data: rows, error: fetchError } = await pipelineClient
            .from('recipe_pipeline_state')
            .select('*')
            .in('status', ['new', 'manual_retry'])
            .limit(25);

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!rows || rows.length === 0) {
            return NextResponse.json({
                ok: true,
                summary: {
                    processed: 0,
                    normalized_ok: 0,
                    blocked_review: 0,
                    message: 'No pending recipes',
                },
            });
        }

        // 3. Process Batch
        let processed = 0;
        let successCount = 0;
        let failCount = 0;

        const results = await Promise.all(
            rows.map(async row => {
                processed++;
                const rowId = row.legacy_recipe_id; // PK is legacy_recipe_id based on previous context, but strictly using row PK is safer if different.
                // However, IngestionAgent uses legacy_recipe_id from the row object.
                // Let's rely on the row object identifying itself.

                // A. Mark In-Progress
                const { error: startErr } = await pipelineClient
                    .from('recipe_pipeline_state')
                    .update({
                        status: 'ingestion_in_progress',
                        last_processed_at: new Date().toISOString(),
                    })
                    .eq('legacy_recipe_id', row.legacy_recipe_id);

                if (startErr) {
                    // If we can't lock it, skip it
                    console.error(`Failed to lock row ${row.legacy_recipe_id}:`, startErr);
                    return { id: row.legacy_recipe_id, status: 'lock_failed' };
                }

                // B. Process via Agent
                const result = await IngestionAgent.process(row);

                // C. Handle Result
                if (result.success) {
                    successCount++;
                    await pipelineClient
                        .from('recipe_pipeline_state')
                        .update({
                            status: 'normalized_ok',
                            error_log: null, // Clear previous errors if any
                            last_processed_at: new Date().toISOString(),
                        })
                        .eq('legacy_recipe_id', row.legacy_recipe_id);
                    return { id: row.legacy_recipe_id, status: 'normalized_ok' };
                } else {
                    failCount++;
                    await pipelineClient
                        .from('recipe_pipeline_state')
                        .update({
                            status: 'blocked_review',
                            error_log: result.error, // Store error object directly
                            last_processed_at: new Date().toISOString(),
                        })
                        .eq('legacy_recipe_id', row.legacy_recipe_id);
                    return {
                        id: row.legacy_recipe_id,
                        status: 'blocked_review',
                        error: result.error,
                    };
                }
            })
        );

        // 4. Return Summary
        return NextResponse.json({
            ok: true,
            summary: {
                processed,
                normalized_ok: successCount,
                blocked_review: failCount,
            },
        });
    } catch (error: unknown) {
        console.error('Pipeline Worker Error:', error);
        return NextResponse.json(
            {
                ok: false,
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
