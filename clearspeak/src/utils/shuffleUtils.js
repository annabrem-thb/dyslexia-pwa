/**
 * seededShuffle - A pure utility to shuffle arrays predictably.
 * Required for React idempotency (same input + seed = same output).
 */
export const seededShuffle = (array, seed) => {
  const result = [...array];
  let m = result.length,
    t,
    i;

  // Create a numeric hash from the seed (if it's a string like data.id)
  let currentSeed =
    typeof seed === 'string'
      ? seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
      : seed || 0;

  // LCG-like pseudo-random generator
  const rand = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  while (m) {
    i = Math.floor(rand(currentSeed + m) * m--);
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }
  return result;
};
