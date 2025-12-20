
import { NextResponse } from 'next/server';
import { pipelineClient } from '@/lib/pipeline-client';
import { TranslationAgent } from '@/lib/pipeline/translation-agent';
import { QualityScorer } from '@/lib/pipeline/quality-scorer';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        const targetLang = searchParams.get('lang') || 'en';

        console.log('Auth Check:', { incoming: secret, env: process.env.NEXT_PUBLIC_PIPELINE_SECRET ? 'Exits' : 'Missing' });

        // Temporary fallback for debug if env is missing
        const SERVER_SECRET = process.env.NEXT_PUBLIC_PIPELINE_SECRET || 'pipeline_secret_777';

        if (secret !== SERVER_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // fetch normalized recipes that need translation
        // Start simple: Iterate normalized recipes.
        // Check if translation exists in 'content_translations' for targetLang.
        // Since we don't have a simple 'left join' in one query easily with postgREST for "missing rows",
        // we will fetch a batch of normalized recipes and check their translation status in code or via a second query.

        // Optimization: We could RPC, but for now:
        // Fetch 10 normalized recipes.
        // Ideally we want those that are NOT in content_translations for this lang.

        // Let's rely on recipe_pipeline_state for finding "valid/normalized" recipes first.
        // 1. Get list of already translated IDs to exclude
        // This prevents the "Skipped Loop" where we keep fetching the same completed 50 rows.
        // 2. Fetch Candidates with Offset
        // We rely on the client (manual script) to iterate through the table using 'offset'.
        // PRIORITY FETCH: check for 'manual_retry' first (user forced resets)
        const offset = parseInt(searchParams.get('offset')) || 0;
        const targetId = searchParams.get('id'); // NEW: Specific targeting
        // Dynamic Batch Size (Default reduced to 2 for stability)
        const BATCH_LIMIT = parseInt(searchParams.get('batch_size')) || 2;
        let rows = [];

        if (targetId) {
            // mode: SINGLE TARGET (Client Managed)
            console.log(`[Target Mode] Fetching specific legacy ID: ${targetId}`);
            const { data: specificRow, error: specificErr } = await pipelineClient
                .from('recipe_pipeline_state')
                .select(`legacy_recipe_id, status`)
                .eq('legacy_recipe_id', targetId)
                //.eq('status', 'manual_retry') // Optional: enforce status?
                .single();

            if (specificRow) {
                rows = [specificRow];
            } else {
                console.warn(`Target ID ${targetId} not found or not in pipeline.`);
            }
        } else {
            // mode: AUTO BATCH (Pull from DB)
            const { data: retryRows, error: retryErr } = await pipelineClient
                .from('recipe_pipeline_state')
                .select(`legacy_recipe_id, status`)
                .eq('status', 'manual_retry')
                .order('legacy_recipe_id', { ascending: true }) // Stable sort
                .range(offset, offset + BATCH_LIMIT - 1); // Apply pagination

            if (retryRows && retryRows.length > 0) {
                console.log(`[Priority] Found ${retryRows.length} items to retry.`);
                rows = [...retryRows];
            }

            // Fill remaining slots with normal offset-based query
            if (rows.length < BATCH_LIMIT) {
                const remaining = BATCH_LIMIT - rows.length;
                const { data: normalRows, error: fetchError } = await pipelineClient
                    .from('recipe_pipeline_state')
                    .select(`legacy_recipe_id, status`)
                    .in('status', ['normalized_ok', 'translated_en', 'published', 'translated_fr', 'translated_de'])
                    .order('legacy_recipe_id', { ascending: true }) // Fix: Ensure stable pagination
                    .range(offset, offset + remaining - 1);

                if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`);
                if (normalRows && normalRows.length > 0) {
                    rows = [...rows, ...normalRows];
                }
            }
        }



        if (!rows || rows.length === 0) {
            return NextResponse.json({ ok: true, message: 'No normalized recipes found' });
        }

        const results = {
            targetLang,
            success: 0,
            failed: 0,
            skipped: 0,
            details: []
        };

        let processedCount = 0;

        for (const row of rows) {
            if (processedCount >= BATCH_LIMIT) break;

            const legacyId = row.legacy_recipe_id;
            try {
                // 1. Get UUID
                const { data: registryData } = await pipelineClient
                    .from('registry_recipes')
                    .select('id')
                    .eq('legacy_recipe_id', legacyId)
                    .single();

                if (!registryData) continue; // Should not happen if normalized_ok
                const recipeUUID = registryData.id;

                // 2. Check if already translated for targetLang
                // FIX: If manual_retry, we WANT to regenerate, so skip the "exists" check.
                const isRetry = row.status === 'manual_retry';

                if (!isRetry) {
                    const { data: existing } = await pipelineClient
                        .from('content_translations')
                        .select('id')
                        .eq('recipe_id', recipeUUID)
                        .eq('language_code', targetLang)
                        .single();

                    if (existing) {
                        console.log(`[Skip] LegacyId: ${legacyId} -> UUID: ${recipeUUID} has translation ${existing.id} (${targetLang})`);
                        results.skipped++;
                        results.details.push({ id: legacyId, status: 'skipped', reason: `Translation exists: ${existing.id}` }); // Debug info
                        continue;
                    }
                }

                // 3. Fetch Source Data
                const { data: sourceData } = await pipelineClient
                    .from('recipes')
                    .select('name, instructions, ingredients') // <--- Added ingredients
                    .eq('id', legacyId)
                    .single();

                if (!sourceData) continue;

                // 4. Fetch Context (Optional secondary context)
                const { data: ingRaw } = await pipelineClient
                    .from('recipe_ingredients')
                    .select('raw_note_fa')
                    .eq('recipe_id', recipeUUID);

                // MERGE contexts: Prefer the main 'ingredients' array from legacy as it has quantities
                let context = sourceData.ingredients || [];
                // If legacy ingredients is empty, fallback to recipe_ingredients notes
                if (context.length === 0 && ingRaw) {
                    context = ingRaw.map(i => i.raw_note_fa).filter(Boolean);
                }

                // 5. Call Agent
                const agentInput = {
                    recipe_id: recipeUUID,
                    source_title: sourceData.name,
                    source_instructions: Array.isArray(sourceData.instructions) ? sourceData.instructions : [sourceData.instructions],
                    ingredients_context: context,
                    targetLanguage: targetLang
                };
                console.log(`[Translate Debug] Context for ${sourceData.name}:`, JSON.stringify(context).slice(0, 200));

                const translation = await TranslationAgent.translate(agentInput);

                // 6. Score (Minimal)
                const quality = QualityScorer.score({
                    sourceText: agentInput.source_title,
                    targetText: translation.title,
                    sourceStepCount: agentInput.source_instructions.length,
                    targetStepCount: translation.instructions.length,
                    glossaryTokens: []
                });

                // 7. Save
                const { error: saveErr } = await pipelineClient
                    .from('content_translations')
                    .upsert({
                        recipe_id: recipeUUID,
                        language_code: targetLang, // Dynamic Code
                        title: translation.title,
                        instructions: translation.instructions, // JSONB
                        ingredients: translation.ingredients || [],
                        // Store extended info in qa_metadata JSONB since columns don't exist
                        qa_metadata: {
                            ...quality.metadata,
                            nutrition: translation.nutrition || {},
                            internal_score: translation.internal_score || {},
                            marketing_description: translation.marketing_description || '',
                            // RICH CONTENT MAPPING (CRITICAL FIX)
                            origin_history: translation.origin_history,
                            why_this_version: translation.why_this_version,
                            sensory_experience: translation.sensory_experience,
                            chef_guide: translation.chef_guide,
                            dietary_tags: translation.dietary_tags,
                            occasion_tags: translation.occasion_tags,
                            difficulty_level: translation.difficulty_level,
                            ingredient_substitutions: translation.ingredient_substitutions,
                            equipment_needed: translation.equipment_needed,
                            flavor_profile: translation.flavor_profile,
                            pairings: translation.pairings,
                            estimated_cost: translation.estimated_cost,
                            seo_keywords: translation.seo_keywords,
                            seo_meta_description: translation.seo_meta_description,
                            social_share_copy: translation.social_share_copy,
                            allergen_contains: translation.allergen_contains,
                            kid_friendly: translation.kid_friendly,
                            // Added per user request for UI Box
                            health_benefits: translation.health_benefits,
                            category: translation.category
                        },
                        publish_status: 'published',
                        version: 2, // Bump version
                        last_updated: new Date().toISOString(),
                        confidence_score: quality.score,
                        auto_published: true
                    }, { onConflict: 'recipe_id, language_code' });

                if (saveErr) throw new Error(`Save failed: ${saveErr.message}`);

                // 7b. ROOT CAUSE FIX: Update Legacy Data in 'recipes' table
                // We overwrite the old Farsi category with the new clean English one.
                if (translation.category) {
                    const { error: legacyUpdateErr } = await pipelineClient
                        .from('recipes')
                        .update({ category: translation.category })
                        .eq('id', legacyId);

                    if (legacyUpdateErr) {
                        console.error(`Failed to update legacy category for ${legacyId}:`, legacyUpdateErr.message);
                        throw new Error(`Legacy Update Failed: ${legacyUpdateErr.message}`);
                    }

                    // 7b-2. VALIDATION LOCK (Read-After-Write Check)
                    // As requested: "ye gofl barash dorost kon" - Verify the data actually changed.
                    const { data: verifyData } = await pipelineClient
                        .from('recipes')
                        .select('category')
                        .eq('id', legacyId)
                        .single();

                    if (!verifyData || verifyData.category !== translation.category) {
                        const actual = verifyData ? verifyData.category : 'null';
                        throw new Error(`CRITICAL: Data Verification Failed! Expected category '${translation.category}' but found '${actual}'. Write operation may have been silently ignored.`);
                    }

                    console.log(`[Root Fix] Verified recipes.category for ${legacyId} is now "${translation.category}"`);
                }

                // 7c. Update Pipeline State
                // This ensures we don't pick up the same 'manual_retry' item again in the next loop
                const { error: stateErr } = await pipelineClient
                    .from('recipe_pipeline_state')
                    .update({
                        status: 'published',
                        last_processed_at: new Date().toISOString()
                    })
                    .eq('legacy_recipe_id', legacyId);

                if (stateErr) console.warn(`State update warning for ${legacyId}:`, stateErr.message);

                results.success++;
                results.details.push({ id: legacyId, title: translation.title });
                processedCount++;

            } catch (err) {
                console.error(`Failed ${legacyId}:`, err);
                results.failed++;
                results.details.push({ id: legacyId, error: err.message });
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
