import { NextResponse } from 'next/server';
import { pipelineClient } from '@/lib/pipeline-client';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        const SERVER_SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';

        if (secret !== SERVER_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🔄 RESETTING ALL RECIPES TO manual_retry...');

        // Reset all valid recipes
        // FIX: Update 'recipe_pipeline_state' table, not 'recipes'
        // FIX: Column is 'status', not 'recipe_pipeline_state'
        const { error } = await pipelineClient
            .from('recipe_pipeline_state')
            .update({ status: 'manual_retry' })
            .gt('legacy_recipe_id', 0);

        if (error) {
            console.error('Reset Failed:', error);
            return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, message: 'All recipes reset to manual_retry' });

    } catch (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
