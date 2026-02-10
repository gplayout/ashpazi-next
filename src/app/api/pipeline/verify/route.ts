import { type NextRequest, NextResponse } from 'next/server';
import { pipelineClient as supabase } from '../../../../lib/pipeline-client';
import { IngestionAgent } from '../../../../lib/pipeline/ingestion-agent';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Dev only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode'); // 'setup', 'run-agent', 'trigger-api', 'check', 'cleanup'

    const TEST_ID_VALID = 9999901;
    const TEST_ID_INVALID = 9999902;

    try {
        if (mode === 'setup') {
            const envCheck = {
                hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                hasCronSecret: !!process.env.CRON_SECRET,
            };

            // 1. Valid Recipe
            const { error: r1Err } = await supabase.from('recipes').upsert({
                id: TEST_ID_VALID,
                title: 'Test Verification Valid',
                ingredients: ['نمک', 'فلفل سیاه'],
                published: true,
            });
            if (r1Err) throw new Error(`Setup Fail R1: ${r1Err.message}`);

            // 2. Invalid Recipe
            const { error: r2Err } = await supabase.from('recipes').upsert({
                id: TEST_ID_INVALID,
                title: 'Test Verification Invalid',
                ingredients: ['unobtanium_crystal'],
                published: true,
            });
            if (r2Err) throw new Error(`Setup Fail R2: ${r2Err.message}`);

            // 3. Pipeline State 'new'
            const { error: pErr } = await supabase.from('recipe_pipeline_state').upsert([
                { legacy_recipe_id: TEST_ID_VALID, status: 'new' },
                { legacy_recipe_id: TEST_ID_INVALID, status: 'new' },
            ]);
            if (pErr) throw new Error(`Setup Fail State: ${pErr.message}`);

            return NextResponse.json({
                message: 'Setup Complete. Created IDs: ' + TEST_ID_VALID + ', ' + TEST_ID_INVALID,
                env_check: envCheck,
            });
        }

        if (mode === 'run-agent') {
            // Run Agent directly on these specific rows
            const { data: rows } = await supabase
                .from('recipe_pipeline_state')
                .select('*')
                .in('legacy_recipe_id', [TEST_ID_VALID, TEST_ID_INVALID]);

            const results = [];
            for (const row of rows ?? []) {
                const res = await IngestionAgent.process(row);
                results.push({ id: row.legacy_recipe_id, result: res });

                // Simulate status update (since Agent doesn't update status, API does)
                if (res.success) {
                    await supabase
                        .from('recipe_pipeline_state')
                        .update({ status: 'normalized_ok', error_log: null })
                        .eq('legacy_recipe_id', row.legacy_recipe_id);
                } else {
                    await supabase
                        .from('recipe_pipeline_state')
                        .update({ status: 'blocked_review', error_log: res.error })
                        .eq('legacy_recipe_id', row.legacy_recipe_id);
                }
            }
            return NextResponse.json({ results });
        }

        if (mode === 'trigger-api') {
            // Calls the actual /api/pipeline/ingest endpoint using the server's secret
            const secret = process.env.CRON_SECRET;
            if (!secret) return NextResponse.json({ error: 'CRON_SECRET not set on server' });

            // Call ourselves
            const protocol = request.headers.get('x-forwarded-proto') || 'http';
            const host = request.headers.get('host');
            const apiUrl = `${protocol}://${host}/api/pipeline/ingest?secret=${secret}`;

            const res = await fetch(apiUrl);
            const json = await res.json();
            return NextResponse.json({
                triggered_url: apiUrl,
                status: res.status,
                response: json,
            });
        }

        if (mode === 'check') {
            const { data } = await supabase
                .from('recipe_pipeline_state')
                .select('legacy_recipe_id, status, error_log')
                .in('legacy_recipe_id', [TEST_ID_VALID, TEST_ID_INVALID]);

            // Check Registry for Valid ID
            const { data: reg } = await supabase
                .from('registry_recipes')
                .select('id, legacy_recipe_id')
                .eq('legacy_recipe_id', TEST_ID_VALID);

            return NextResponse.json({ pipeline_state: data, registry_recipe: reg });
        }

        if (mode === 'cleanup') {
            // Get registry IDs to clean ingredients
            const { data: regs } = await supabase
                .from('registry_recipes')
                .select('id')
                .in('legacy_recipe_id', [TEST_ID_VALID, TEST_ID_INVALID]);
            const regIds = regs?.map(r => r.id) || [];

            if (regIds.length > 0) {
                await supabase.from('recipe_ingredients').delete().in('recipe_id', regIds);
                await supabase.from('recipe_groups').delete().in('recipe_id', regIds);
                await supabase.from('registry_recipes').delete().in('id', regIds);
            }

            await supabase
                .from('recipe_pipeline_state')
                .delete()
                .in('legacy_recipe_id', [TEST_ID_VALID, TEST_ID_INVALID]);
            await supabase.from('recipes').delete().in('id', [TEST_ID_VALID, TEST_ID_INVALID]);

            return NextResponse.json({ message: 'Cleanup Done' });
        }

        return NextResponse.json({
            message: 'Usage: ?mode=[setup|run-agent|trigger-api|check|cleanup]',
        });
    } catch (e: unknown) {
        return NextResponse.json(
            {
                error: e instanceof Error ? e.message : String(e),
                stack: e instanceof Error ? e.stack : undefined,
            },
            { status: 500 }
        );
    }
}
