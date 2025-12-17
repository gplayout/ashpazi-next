
import { NextResponse } from 'next/server';
import { pipelineClient } from '@/lib/pipeline-client';
import { TranslationAgent } from '@/lib/pipeline/translation-agent';
import { QualityScorer } from '@/lib/pipeline/quality-scorer';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // 1. Auth Check (Same secret as ingestion)
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== process.env.NEXT_PUBLIC_PIPELINE_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Pending Rows (Limit 10 per batch for Pilot)
        // We need 'normalized_ok' AND 'translated_en' IS NULL. 
        // Status usage: The user said "Select status = 'normalized_ok'".
        // We will update status to 'translated_en' on success.

        // Join with registry_recipes to get UUID and instructions?
        // recipe_pipeline_state has legacy_recipe_id.
        // We need to fetch pipeline state first.

        const { data: rows, error: fetchError } = await pipelineClient
            .from('recipe_pipeline_state')
            .select('legacy_recipe_id')
            .eq('status', 'normalized_ok')
            .limit(10); // Pilot Limit

        if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`);

        if (!rows || rows.length === 0) {
            return NextResponse.json({ ok: true, message: 'No pending translations' });
        }

        const results = {
            success: 0,
            failed: 0,
            details: []
        };

        // 3. Process Loop
        for (const row of rows) {
            const legacyId = row.legacy_recipe_id;
            try {
                // A. Fetch Source Data (Registry + Ingredients + Legacy Title/Instructions if needed?)
                // Phase 3.1 normalized to registry_recipes.
                // registry_recipes has prep/cook/etc. Does it have source instructions?
                // Wait, IngestionAgent read legacyRecipe from 'recipes'. 
                // registry_recipes might NOT have instructions if they weren't upserted there.
                // Let's re-read legacy table for Source Title/Instructions to be safe.
                // AND registry_recipes for the UUID.

                // Fetch UUID from registry
                const { data: registryData, error: regErr } = await pipelineClient
                    .from('registry_recipes')
                    .select('id')
                    .eq('legacy_recipe_id', legacyId)
                    .single();

                if (regErr || !registryData) {
                    throw new Error("Registry ID not found for normalized recipe");
                }
                const recipeUUID = registryData.id;

                // Fetch Source Text (from legacy 'recipes' table)
                const { data: sourceData, error: srcErr } = await pipelineClient
                    .from('recipes')
                    .select('name, instructions')
                    .eq('id', legacyId)
                    .single();

                if (srcErr || !sourceData) {
                    throw new Error("Legacy source data not found");
                }

                // To get ingredients context, we query normalized ingredients joined with master names
                // recipe_ingredients -> ingredient_translations(fa)? Or master code?
                // Let's fetch the ingredient names directly.
                const { data: ingData } = await pipelineClient
                    .from('recipe_ingredients')
                    .select(`
                    quantity_value,
                    unit_id,
                    ingredient_id,
                    ingredients_master!inner (code),
                    ingredient_translations:ingredients_master!inner (ingredient_translations)
                 `) // This deep join is complex.
                    // Simpler: Just fetch raw_note_fa from recipe_ingredients if we stored it?
                    // IngestionAgent stored 'raw_note_fa'. This is perfect for context!
                    .eq('recipe_id', recipeUUID)
                    .select('raw_note_fa');

                // Wait, query above was pseudo-code. Correct is:
                const { data: ingRaw, error: ingErr } = await pipelineClient
                    .from('recipe_ingredients')
                    .select('raw_note_fa')
                    .eq('recipe_id', recipeUUID);

                const context = ingRaw ? ingRaw.map(i => i.raw_note_fa).filter(Boolean) : [];

                // B. Call Agent
                // sourceData.instructions typically JSON or TEXT[]? Next.js inspection showed it as array in prev phase
                // legacy 'recipes.instructions' is TEXT[] or JSONB? 
                // In setup_test_data.js it was array. 
                // We assume array.

                const agentInput = {
                    recipe_id: recipeUUID,
                    source_title: sourceData.name, // 'name' in legacy table based on history
                    source_instructions: Array.isArray(sourceData.instructions) ? sourceData.instructions : [sourceData.instructions],
                    ingredients_context: context
                };

                const translation = await TranslationAgent.translate(agentInput);

                // C. SCORE (Phase 4 Shadow Mode)
                const combinedSource = `${agentInput.source_title}\n${agentInput.source_instructions.join('\n')}`;
                const combinedTarget = `${translation.title_en}\n${translation.instructions_en.map(i => i.text).join('\n')}`;

                // For meaningful glossary check, ideally we need EN dictionary.
                // For now, we pass the FA context tokens just to satisfy signature diffs if we evolve it.
                // But Scorer logic currently returns neutral for glossary.
                // We use length and format primarily.

                const quality = QualityScorer.score({
                    sourceText: combinedSource,
                    targetText: combinedTarget,
                    sourceStepCount: agentInput.source_instructions.length,
                    targetStepCount: translation.instructions_en.length,
                    glossaryTokens: [] // Placeholder until we have EN dictionary
                });

                // D. Save to DB (Status=Draft, Auto-publish OFF)
                const { error: saveErr } = await pipelineClient
                    .from('content_translations')
                    .upsert({
                        recipe_id: recipeUUID,
                        language_code: 'en',
                        title: translation.title_en,
                        instructions: translation.instructions_en, // JSONB
                        publish_status: 'draft',
                        version: 1,
                        last_updated: new Date().toISOString(),
                        confidence_score: quality.score,
                        qa_metadata: quality.metadata,
                        auto_published: false
                    }, { onConflict: 'recipe_id, language_code' });

                if (saveErr) throw new Error(`Save failed: ${saveErr.message}`);

                // D. Update Pipeline State
                await pipelineClient
                    .from('recipe_pipeline_state')
                    .update({
                        status: 'translated_en',
                        last_processed_at: new Date().toISOString(),
                        error_log: null
                    })
                    .eq('legacy_recipe_id', legacyId);

                results.success++;
                results.details.push({ id: legacyId, status: 'ok' });

            } catch (processError) {
                console.error(`Translation Failed for ${row.legacy_recipe_id}:`, processError);

                // Update Pipeline State to error
                await pipelineClient
                    .from('recipe_pipeline_state')
                    .update({
                        status: 'translation_error',
                        last_processed_at: new Date().toISOString(),
                        error_log: {
                            message: processError.message,
                            stack: processError.stack
                        }
                    })
                    .eq('legacy_recipe_id', row.legacy_recipe_id);

                results.failed++;
                results.details.push({ id: row.legacy_recipe_id, error: processError.message });
            }
        }

        return NextResponse.json({
            ok: true,
            summary: results
        });

    } catch (error) {
        console.error('Translation Worker Error:', error);
        return NextResponse.json({
            ok: false,
            error: error.message
        }, { status: 500 });
    }
}
