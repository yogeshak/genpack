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
export declare function defaultRng(): Rng;
/**
 * Seeded RNG (mulberry32) for reproducible tests.
 */
export declare function seededRng(seed: number): Rng;
//# sourceMappingURL=Rng.d.ts.map