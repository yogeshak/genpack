/**
 * GENPACK backend - Phase 1 & 2
 * Exports domain, services, GA runner, and heuristics.
 */

export { normalized, area, perimeter } from './domain/Rect';
export type { Rect } from './domain/Rect';
export type { PlacedRect } from './domain/PlacedRect';
export type { PackingInput } from './domain/PackingInput';
export {
  DEFAULT_POPULATION_SIZE,
  DEFAULT_PCROSS,
  DEFAULT_PMUTE,
  DEFAULT_MAX_GEN,
  MAX_ITEMS,
} from './domain/PackingInput';
export type { RunResult, GenerationReport } from './domain/RunResult';
export { Pivot } from './domain/Pivot';
export { Chromosome } from './domain/Chromosome';
export { Population } from './domain/Population';
export { BottomLeftPlacer } from './domain/BottomLeftPlacer';
export type { PlaceResult } from './domain/BottomLeftPlacer';
export { GeneticRunner } from './domain/GeneticRunner';
export type { GeneticRunnerOptions } from './domain/GeneticRunner';
export { HeuristicSolver } from './domain/HeuristicSolver';
export type { HeuristicMethod } from './domain/HeuristicSolver';
export { defaultRng, seededRng } from './util/Rng';
export type { Rng } from './util/Rng';
export {
  parseFileContent,
  parseAndValidate,
} from './services/ParseService';
export type { ParseResult, ParseFullResult } from './services/ParseService';
