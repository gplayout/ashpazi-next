interface QualityScorerInput {
    sourceText: string;
    targetText: string;
    sourceStepCount: number;
    targetStepCount: number;
    glossaryTokens?: string[];
}

interface QualityMetadata {
    length_ratio: number;
    length_score: number;
    step_ratio: number;
    fmt_score: number;
    lang_score: number;
    glossary_score: number;
    note: string;
    agent_len: number;
    agent_checksum: number;
}

interface QualityResult {
    score: number;
    metadata: QualityMetadata;
}

export class QualityScorer {
    static score({
        sourceText,
        targetText,
        sourceStepCount,
        targetStepCount,
    }: QualityScorerInput): QualityResult {
        const meta = {} as QualityMetadata;

        // 1. Length Ratio (40%)
        const sLen = sourceText.length || 1;
        const tLen = targetText.length || 1;
        const ratio = tLen / sLen;

        let lengthScore = 0;
        if (ratio >= 0.8 && ratio <= 1.5) {
            lengthScore = 1.0;
        } else {
            const dist = Math.min(Math.abs(ratio - 0.8), Math.abs(ratio - 1.5));
            lengthScore = Math.max(0, 1.0 - dist * 2);
        }
        meta.length_ratio = parseFloat(ratio.toFixed(2));
        meta.length_score = parseFloat(lengthScore.toFixed(2));

        // 2. Formatting / Structure (25%)
        const stepRatio = targetStepCount / (sourceStepCount || 1);
        let fmtScore = 0;
        if (stepRatio >= 0.8 && stepRatio <= 1.2) {
            fmtScore = 1.0;
        } else {
            fmtScore = Math.max(0, 1.0 - Math.abs(1 - stepRatio));
        }
        meta.step_ratio = parseFloat(stepRatio.toFixed(2));
        meta.fmt_score = parseFloat(fmtScore.toFixed(2));

        // 3. Language Probability (20%)
        const persianRegex = /[آ-ی]/;
        const hasPersian = persianRegex.test(targetText);
        const langScore = hasPersian ? 0.0 : 1.0;
        meta.lang_score = langScore;

        // 4. Glossary Match (15%) - Placeholder
        const glossaryScore = 1.0;
        meta.glossary_score = glossaryScore;
        meta.note = 'Glossary check requires EN dictionary (future)';

        meta.agent_len = tLen;
        meta.agent_checksum = targetText.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

        // Weighted Sum
        const total = lengthScore * 0.4 + fmtScore * 0.25 + langScore * 0.2 + glossaryScore * 0.15;

        return {
            score: parseFloat(total.toFixed(2)),
            metadata: meta,
        };
    }
}
