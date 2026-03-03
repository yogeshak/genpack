import type { Rect } from './Rect.js';
/**
 * Parsed GENPACK1 input + run parameters.
 */
export interface PackingInput {
    readonly itemCount: number;
    readonly stockWidth: number;
    readonly rectangles: readonly Rect[];
    readonly pcross: number;
    readonly pmute: number;
    readonly maxGen: number;
    readonly populationSize: number;
}
export declare const DEFAULT_POPULATION_SIZE = 20;
export declare const DEFAULT_PCROSS = 0.8;
export declare const DEFAULT_PMUTE = 0.1;
export declare const DEFAULT_MAX_GEN = 100;
export declare const MAX_ITEMS = 200;
//# sourceMappingURL=PackingInput.d.ts.map