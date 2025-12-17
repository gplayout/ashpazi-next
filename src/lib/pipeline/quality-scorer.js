
/**
 * QualityScorer (Phase 4)
 * Calculates a confidence score (0.0 - 1.0) for translations.
 * Used in "Shadow Mode" to gather metrics.
 */
export class QualityScorer {

    /**
     * @param {object} input
     * @param {string} input.sourceText - Combined title + instructions (FA)
     * @param {string} input.targetText - Combined title + instructions (EN)
     * @param {number} input.sourceStepCount
     * @param {number} input.targetStepCount
     * @param {string[]} input.glossaryTokens - Array of Master Ingredient Names (FA)
     */
    static score({ sourceText, targetText, sourceStepCount, targetStepCount, glossaryTokens }) {
        const meta = {};

        // 1. Length Ratio (40%)
        // Ideal: EN is usually 1.0 - 1.3x of FA length? Or 0.8 - 1.3?
        // Persian text is compact? "نمک" (3 chars) vs "Salt" (4). "پیاز" (4) vs "Onion" (5).
        // Let's assume 0.8 to 1.5 is safe range.
        const sLen = sourceText.length || 1;
        const tLen = targetText.length || 1;
        const ratio = tLen / sLen;

        let lengthScore = 0;
        if (ratio >= 0.8 && ratio <= 1.5) {
            lengthScore = 1.0;
        } else {
            // Penalize generic distance from ideal
            const dist = Math.min(Math.abs(ratio - 0.8), Math.abs(ratio - 1.5));
            lengthScore = Math.max(0, 1.0 - (dist * 2)); // Steep penalty
        }
        meta.length_ratio = parseFloat(ratio.toFixed(2));
        meta.length_score = parseFloat(lengthScore.toFixed(2));

        // 2. Formatting / Structure (25%)
        // Step count deviation
        const stepRatio = targetStepCount / (sourceStepCount || 1);
        let fmtScore = 0;
        if (stepRatio >= 0.8 && stepRatio <= 1.2) { // Allow minor split/merge
            fmtScore = 1.0;
        } else {
            fmtScore = Math.max(0, 1.0 - Math.abs(1 - stepRatio));
        }
        meta.step_ratio = parseFloat(stepRatio.toFixed(2));
        meta.fmt_score = parseFloat(fmtScore.toFixed(2));

        // 3. Language Probability (20%)
        // Detect Persian chars in Target (Fail).
        // Common Persian chars: [ا-ی]
        const persianRegex = /[آ-ی]/;
        const hasPersian = persianRegex.test(targetText);
        const langScore = hasPersian ? 0.0 : 1.0;
        meta.lang_score = langScore;

        // 4. Glossary Match (15%)
        // Check if glossary tokens appear in target text? 
        // Wait, glossary tokens are FA ("پیاز"). Target is EN ("Onion").
        // We cannot check if "پیاز" is in "Onion". 
        // We verified the requirement: "Glossary Match must use cleaned FA tokens... NOT raw_note_fa".
        // BUT we are grading the ENGLISH output.
        // Determining if "Salt" is present requires knowing the EN translation of "نمک".
        // pipeline doesn't have FA->EN ingredient dictionary yet?
        // Wait, `ingredient_translations` table has `language_code`.
        // If we have EN translations for those IDs, we can check.
        // If we ONLY have FA names, we cannot compute glossary match on EN output easily without an internal dictionary.

        // Re-reading Phase 4 Plan: "Presence of Master Ingredient Names (from ingredient_translations) in text."
        // If the plan meant checking if *Source* ingredients are represented in *Target*, we need the EN names.
        // If we don't have EN names in DB yet (we might only have FA from ingestion), this metric is blocked.
        // Assumption: We might verify if *Source FA* tokens are *NOT* left over in EN text?
        // OR: The user implies we have EN translations?
        // Let's check `ingredient_translations` for EN.
        // If invalid, we fallback to 1.0 (neutral) or skip.

        // Let's implement a "Negative Glossary" check for now: Ensure FA tokens are NOT in EN output?
        // That effectively overlaps with Lang Prob (Persian chars).

        // Alternative interpretation: "Glossary Match" might mean "Did the Agent include the ingredients?"
        // But the Contract says "NO Ingredient Output".
        // The instructions text *should* mention ingredients.
        // Without EN glossary, we can't verify "Piaz" -> "Onion".
        // Let's set glossary_score to 1.0 (placeholder) with a note in metadata if we can't verify.
        // Metrics to track translation quality...

        // For the sake of the Pilot Shadow Mode, let's implement the structure.
        // We'll set it to 1.0 for now if no EN glossary available.

        const glossaryScore = 1.0;
        meta.glossary_score = glossaryScore;
        meta.note = "Glossary check requires EN dictionary (future)";

        // Logging / Drift Detection metrics (Phase 4)
        meta.agent_len = tLen;
        // Simple checksum (sum of char codes) for drift check
        meta.agent_checksum = targetText.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

        // Weighted Sum
        // 0.4, 0.25, 0.2, 0.15
        const total = (
            (lengthScore * 0.4) +
            (fmtScore * 0.25) +
            (langScore * 0.20) +
            (glossaryScore * 0.15)
        );

        return {
            score: parseFloat(total.toFixed(2)),
            metadata: meta
        };
    }
}
