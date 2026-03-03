import type { PlacedRect } from './PlacedRect';
/**
 * Result of a single GA or heuristic run.
 */
export interface RunResult {
    readonly packingHeight: number;
    readonly areaWasted: number;
    readonly utilizationFactor: number;
    readonly placements: readonly PlacedRect[];
    readonly generationReports?: readonly GenerationReport[];
}
/**
 * Optional per-generation log (for GA runs).
 */
export interface GenerationReport {
    readonly generation: number;
    readonly bestHeight: number;
    readonly bestIndex: number;
    readonly avgFitness?: number;
}
//# sourceMappingURL=RunResult.d.ts.map