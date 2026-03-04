import type { Rect } from './Rect';
import { Chromosome } from './Chromosome';
import type { Rng } from '../util/Rng';
export declare class Population {
    individuals: Chromosome[];
    bestIndex: number;
    bestFitness: number;
    private readonly placer;
    private readonly rectangles;
    constructor(size: number, stockWidth: number, rectangles: readonly Rect[], rng: Rng, pmute: number);
    /**
     * Evaluate all chromosomes: run BLF, set fitness = packing height.
     */
    evaluateAll(): void;
    updateBest(): void;
    /**
     * Tournament selection: popsize tournaments of size s, each winner = lower fitness.
     */
    selectTournament(rng: Rng, s?: number): Chromosome[];
    /**
     * Single-point crossover on pairs (0,1), (2,3), ... with probability pcross.
     * Replaces this.individuals with the new offspring.
     */
    crossover(pcross: number, rng: Rng): void;
    /**
     * Mutation: each gene flips sign with probability pmute.
     */
    mutate(pmute: number, rng: Rng): void;
}
//# sourceMappingURL=Population.d.ts.map