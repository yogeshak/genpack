import type { PackingInput } from './PackingInput';
import type { RunResult, GenerationReport } from './RunResult';
import { Population } from './Population';
import { BottomLeftPlacer } from './BottomLeftPlacer';
import { area } from './Rect';
import { defaultRng, seededRng, type Rng } from '../util/Rng';

export interface GeneticRunnerOptions {
  /** Optional seed for reproducible runs */
  seed?: number;
  /** Optional RNG (overrides seed if provided) */
  rng?: Rng;
}

export class GeneticRunner {
  private readonly input: PackingInput;
  private readonly rng: Rng;

  constructor(input: PackingInput, options: GeneticRunnerOptions = {}) {
    this.input = input;
    if (options.rng) {
      this.rng = options.rng;
    } else if (options.seed !== undefined) {
      this.rng = seededRng(options.seed);
    } else {
      this.rng = defaultRng();
    }
  }

  run(options?: { includeGenerationReports?: boolean }): RunResult {
    const {
      stockWidth,
      rectangles,
      pcross,
      pmute,
      maxGen,
      populationSize,
      itemCount,
    } = this.input;

    const pop = new Population(populationSize, stockWidth, rectangles, this.rng);
    pop.evaluateAll();
    pop.updateBest();

    let bestChromosome = pop.individuals[pop.bestIndex].copy();
    let bestFitness = pop.bestFitness;
    const reports: GenerationReport[] = options?.includeGenerationReports ? [] : undefined!;

    for (let gen = 0; gen < maxGen - 1; gen++) {
      const selected = pop.selectTournament(this.rng);
      pop.individuals = selected;
      pop.crossover(pcross, this.rng);
      pop.mutate(pmute, this.rng);
      pop.evaluateAll();
      pop.updateBest();

      if (pop.bestFitness < bestFitness) {
        bestFitness = pop.bestFitness;
        bestChromosome = pop.individuals[pop.bestIndex].copy();
      }

      if (reports) {
        let sumFit = 0;
        for (const ch of pop.individuals) sumFit += 1 / ch.fitness;
        reports.push({
          generation: gen + 1,
          bestHeight: bestFitness,
          bestIndex: pop.bestIndex,
          avgFitness: sumFit / pop.individuals.length,
        });
      }
    }

    const placer = new BottomLeftPlacer(stockWidth);
    const ordered = bestChromosome.toOrderedRects(rectangles);
    const placeResult = placer.place(ordered);

    const placements = placeResult.placements.map((p) => {
      const orig = rectangles[p.id];
      const rotated =
        orig != null &&
        p.width === orig.width &&
        p.height === orig.length;
      return { ...p, rotated };
    });

    const totalArea = (() => {
      let sum = 0;
      for (let i = 0; i < itemCount; i++) sum += area(rectangles[i]);
      return sum;
    })();
    const stripArea = bestFitness * stockWidth;
    const areaWasted = stripArea - totalArea;
    const utilizationFactor = totalArea / stripArea;

    return {
      packingHeight: bestFitness,
      areaWasted,
      utilizationFactor,
      placements,
      generationReports: reports?.length ? reports : undefined,
    };
  }
}
