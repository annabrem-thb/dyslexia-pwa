/**
 * Utility to ensure exercise data is consistent and safe to use.
 */
export const sanitizeExerciseData = (data) => {
  return {
    ...data,
    instruction: data.instruction || '',
    word: (data.word || '').trim(),
    options: (data.options || []).map((opt) => ({
      ...opt,
      text: String(opt.text || opt.label || '').trim(),
    })),
    // Fallback for missing phonetic transcription
    phonetic: data.phonetic || null,
  };
};
