/**
 * Random number generator interface for reproducibility.
 * uniformInt(max) returns an integer in [0, max) (max exclusive).
 */
export interface Rng {
  uniformInt(max: number): number;
}

/**
 * RNG using Math.random() (not reproducible).
 */
export function defaultRng(): Rng {
  return {
    uniformInt(max: number): number {
      return Math.floor(Math.random() * max);
    },
  };
}

/**
 * Seeded RNG (mulberry32) for reproducible tests.
 */
export function seededRng(seed: number): Rng {
  let state = seed >>> 0;
  return {
    uniformInt(max: number): number {
      state = (state + 0x6d2b79f5) >>> 0; // mulberry32
      const t = Math.imul(state ^ (state >>> 15), 1 | state);
      const u = (t + Math.imul(t ^ (t >>> 7), 61 | (t ^ (t >>> 7)))) ^ t;
      const v = (u >>> 0) / 0xffffffff;
      return Math.floor(v * max);
    },
  };
}
