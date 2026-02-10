export const PIPELINE_STATUS = {
    NEW: 'new',
    INGESTION_IN_PROGRESS: 'ingestion_in_progress',
    NORMALIZED_OK: 'normalized_ok',
    BLOCKED_REVIEW: 'blocked_review',
    MANUAL_RETRY: 'manual_retry',
} as const;

export type PipelineStatus = (typeof PIPELINE_STATUS)[keyof typeof PIPELINE_STATUS];

export const ERROR_CODES = {
    INGESTION_ERROR: 'INGESTION_ERROR',
    ERR_INGREDIENT_UNMAPPED: 'ERR_INGREDIENT_UNMAPPED',
    ERR_UNIT_UNRECOGNIZED: 'ERR_UNIT_UNRECOGNIZED',
    ERR_NUMERIC_PARSE: 'ERR_NUMERIC_PARSE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

const TRANSITION_RULES: Record<string, string[]> = {
    [PIPELINE_STATUS.NEW]: [PIPELINE_STATUS.INGESTION_IN_PROGRESS],
    [PIPELINE_STATUS.INGESTION_IN_PROGRESS]: [
        PIPELINE_STATUS.NORMALIZED_OK,
        PIPELINE_STATUS.BLOCKED_REVIEW,
    ],
    [PIPELINE_STATUS.BLOCKED_REVIEW]: [PIPELINE_STATUS.MANUAL_RETRY],
    [PIPELINE_STATUS.MANUAL_RETRY]: [PIPELINE_STATUS.INGESTION_IN_PROGRESS],
};

export function isValidTransition(currentStatus: string, nextStatus: string): boolean {
    const allowed = TRANSITION_RULES[currentStatus];
    return !!allowed && allowed.includes(nextStatus);
}
