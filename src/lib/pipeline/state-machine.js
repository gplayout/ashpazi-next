export const PIPELINE_STATUS = {
    NEW: 'new',
    INGESTION_IN_PROGRESS: 'ingestion_in_progress',
    NORMALIZED_OK: 'normalized_ok',
    BLOCKED_REVIEW: 'blocked_review',
    MANUAL_RETRY: 'manual_retry',
    // Future placeholders
    // TRANSLATED: 'translated',
    // QUARANTINE: 'quarantine' 
};

export const ERROR_CODES = {
    // Pipeline Errors
    INGESTION_ERROR: 'INGESTION_ERROR',

    // Validation Errors
    ERR_INGREDIENT_UNMAPPED: 'ERR_INGREDIENT_UNMAPPED',
    ERR_UNIT_UNRECOGNIZED: 'ERR_UNIT_UNRECOGNIZED',
    ERR_NUMERIC_PARSE: 'ERR_NUMERIC_PARSE',
};

// Strict Transition Rules
const TRANSITION_RULES = {
    [PIPELINE_STATUS.NEW]: [PIPELINE_STATUS.INGESTION_IN_PROGRESS],

    [PIPELINE_STATUS.INGESTION_IN_PROGRESS]: [
        PIPELINE_STATUS.NORMALIZED_OK,
        PIPELINE_STATUS.BLOCKED_REVIEW
    ],

    [PIPELINE_STATUS.BLOCKED_REVIEW]: [PIPELINE_STATUS.MANUAL_RETRY],

    [PIPELINE_STATUS.MANUAL_RETRY]: [PIPELINE_STATUS.INGESTION_IN_PROGRESS]
};

/**
 * Validates if a status transition is allowed.
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @returns {boolean}
 */
export function isValidTransition(currentStatus, nextStatus) {
    const allowed = TRANSITION_RULES[currentStatus];
    return allowed && allowed.includes(nextStatus);
}
