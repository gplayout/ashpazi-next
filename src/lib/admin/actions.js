import { pipelineClient as supabase } from '../pipeline-client';

/**
 * Retrieves all blocked recipes from the pipeline queue.
 * Join with 'recipes' table to get the human-readable title.
 */
export async function getBlockedRecipes() {
    const { data, error } = await supabase
        .from('recipe_pipeline_state')
        .select(`
      legacy_recipe_id,
      status,
      error_log,
      last_processed_at,
      recipes!inner (name)
    `)
        .eq('status', 'blocked_review')
        .order('last_processed_at', { ascending: false });

    if (error) {
        throw new Error(`getBlockedRecipes failed: ${error.message}`);
    }
    return data;
}

/**
 * Maps a raw Persian ingredient string to an EXISTING master ingredient ID.
 * @param {string} rawFaName - The exact raw string to map (e.g., "UnmappedThing")
 * @param {number} ingredientId - The existing ID from ingredients_master
 */
export async function mapToExistingIngredient(rawFaName, ingredientId) {
    const { error } = await supabase
        .from('ingredient_translations')
        .insert({
            name: rawFaName,
            ingredient_id: ingredientId,
            language_code: 'fa'
        });

    if (error) {
        throw new Error(`mapToExistingIngredient failed: ${error.message}`);
    }
    return { success: true };
}

/**
 * Creates a NEW master ingredient and maps the raw Persian string to it.
 * @param {string} ingredientCode - Unique code for master (e.g., "new_spice")
 * @param {string} rawFaName - The exact raw string to map
 */
export async function createNewIngredient(ingredientCode, rawFaName) {
    // Step 1: Create Master
    const { data: master, error: masterErr } = await supabase
        .from('ingredients_master')
        .insert({ code: ingredientCode })
        .select('id')
        .single();

    if (masterErr) {
        throw new Error(`createNewIngredient (Master) failed: ${masterErr.message}`);
    }

    // Step 2: Create Translation
    const { error: transErr } = await supabase
        .from('ingredient_translations')
        .insert({
            name: rawFaName,
            ingredient_id: master.id,
            language_code: 'fa'
        });

    if (transErr) {
        // Note: In a real system we might rollback master, but here we throw.
        throw new Error(`createNewIngredient (Translation) failed: ${transErr.message}`);
    }

    return { success: true, newId: master.id };
}

/**
 * Permanently archives a recipe, removing it from the active pipeline.
 * @param {number} legacyRecipeId 
 */
export async function archiveRecipe(legacyRecipeId) {
    const { error } = await supabase
        .from('recipe_pipeline_state')
        .update({
            status: 'archived_error',
            last_processed_at: new Date().toISOString()
        })
        .eq('legacy_recipe_id', legacyRecipeId);

    if (error) {
        throw new Error(`archiveRecipe failed: ${error.message}`);
    }
    return { success: true };
}

/**
 * Resets a recipe to 'manual_retry' so the worker processes it again.
 * Clears the error log.
 * @param {number} legacyRecipeId 
 */
export async function retryRecipe(legacyRecipeId) {
    const { error } = await supabase
        .from('recipe_pipeline_state')
        .update({
            status: 'manual_retry',
            error_log: null,
            last_processed_at: new Date().toISOString()
        })
        .eq('legacy_recipe_id', legacyRecipeId);

    if (error) {
        throw new Error(`retryRecipe failed: ${error.message}`);
    }
    return { success: true };
}

/**
 * Retrieves DRAFT translations for review.
 */
export async function getDraftTranslations() {
    const { data, error } = await supabase
        .from('content_translations')
        .select(`
      id,
      title,
      language_code,
      publish_status,
      last_updated,
      registry_recipes:recipe_id (
        id,
        legacy_recipe_id
      )
    `)
        .eq('publish_status', 'draft')
        .order('last_updated', { ascending: false });

    if (error) {
        throw new Error(`getDraftTranslations failed: ${error.message}`);
    }
    return data;
}

/**
 * Publishes a translation, making it visible to the public API.
 * @param {number} translationId 
 */
export async function publishTranslation(translationId) {
    // 1. Fetch metadata for logging (Phase 4 Correlation)
    const { data: row } = await supabase
        .from('content_translations')
        .select('confidence_score, qa_metadata, title, instructions')
        .eq('id', translationId)
        .single();

    if (row) {
        // Calculate current length (approx)
        const instructionsText = Array.isArray(row.instructions)
            ? row.instructions.map(i => i.text).join('\n')
            : JSON.stringify(row.instructions || "");
        const currentCombined = `${row.title}\n${instructionsText}`;
        const currentLen = currentCombined.length;

        // Extract agent_len from metadata if available
        const meta = row.qa_metadata || {};
        const agentLen = meta.agent_len || 0;

        // Structured Log
        console.log(JSON.stringify({
            event: "translation_published",
            translation_id: translationId,
            confidence_score: row.confidence_score,
            agent_len: agentLen,
            current_len: currentLen,
            timestamp: new Date().toISOString()
        }));
    }

    // 2. Perform Update
    const { error } = await supabase
        .from('content_translations')
        .update({
            publish_status: 'published',
            last_updated: new Date().toISOString()
        })
        .eq('id', translationId);

    if (error) {
        throw new Error(`publishTranslation failed: ${error.message}`);
    }
    return { success: true };
}
