import type { Rect } from './Rect';
import type { PackingInput } from './PackingInput';
import { Chromosome } from './Chromosome';
import { BottomLeftPlacer } from './BottomLeftPlacer';
import { normalized, area, perimeter } from './Rect';
import type { Rng } from '../util/Rng';

const TOURNAMENT_SIZE = 2;
const ROTATION_PROB = 0.3;

/**
 * Build chromosome from order (indices 0..n-1) and random rotations.
 * Gene = sign * (index + 1), so 1-based: 1..n or -1..-n. Negative = rotate 90°.
 * Using 1-based allows mutation to flip rect 0 (gene 1 ↔ -1); 0-based would make -0 === 0.
 */
function buildChromosome(order: number[], _rectangles: readonly Rect[], rng: Rng): Chromosome {
  const genes = order.map((idx) => {
    const sign = rng.uniformInt(1000) / 1000 < ROTATION_PROB ? -1 : 1;
    return sign * (idx + 1);
  });
  return new Chromosome(genes);
}

/** Order indices by criterion (descending for length/width/area/perimeter). */
function orderByLength(rectangles: readonly Rect[]): number[] {
  const withIdx = rectangles.map((r, i) => ({ i, r: normalized(r) }));
  withIdx.sort((a, b) => b.r.length - a.r.length);
  return withIdx.map((x) => x.i);
}

function orderByWidth(rectangles: readonly Rect[]): number[] {
  const withIdx = rectangles.map((r, i) => ({ i, r: normalized(r) }));
  withIdx.sort((a, b) => b.r.width - a.r.width);
  return withIdx.map((x) => x.i);
}

function orderByArea(rectangles: readonly Rect[]): number[] {
  const withIdx = rectangles.map((r, i) => ({ i, r: normalized(r), a: area(r) }));
  withIdx.sort((a, b) => b.a - a.a);
  return withIdx.map((x) => x.i);
}

function orderByPerimeter(rectangles: readonly Rect[]): number[] {
  const withIdx = rectangles.map((r, i) => ({ i, r: normalized(r), p: perimeter(r) }));
  withIdx.sort((a, b) => b.p - a.p);
  return withIdx.map((x) => x.i);
}

/** Random permutation of 0..n-1. */
function randomPermutation(n: number, rng: Rng): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = rng.uniformInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class Population {
  individuals: Chromosome[];
  bestIndex: number;
  bestFitness: number;
  private readonly placer: BottomLeftPlacer;
  private readonly rectangles: readonly Rect[];

  constructor(
    size: number,
    stockWidth: number,
    rectangles: readonly Rect[],
    rng: Rng
  ) {
    this.rectangles = rectangles;
    this.placer = new BottomLeftPlacer(stockWidth);
    this.individuals = [];
    this.bestIndex = 0;
    this.bestFitness = Infinity;

    const n = rectangles.length;
    for (let i = 0; i < size; i++) {
      let order: number[];
      switch (i) {
        case 0:
          order = orderByLength(rectangles);
          break;
        case 1:
          order = orderByWidth(rectangles);
          break;
        case 2:
          order = orderByPerimeter(rectangles);
          break;
        case 3:
          order = orderByArea(rectangles);
          break;
        default:
          order = randomPermutation(n, rng);
          break;
      }
      this.individuals.push(buildChromosome(order, rectangles, rng));
    }
  }

  /**
   * Evaluate all chromosomes: run BLF, set fitness = packing height.
   */
  evaluateAll(): void {
    const n = this.rectangles.length;
    for (let i = 0; i < this.individuals.length; i++) {
      const ordered = this.individuals[i].toOrderedRects(this.rectangles);
      const result = this.placer.place(ordered);
      this.individuals[i].fitness = result.height;
    }
  }

  updateBest(): void {
    for (let i = 0; i < this.individuals.length; i++) {
      if (this.individuals[i].fitness < this.bestFitness) {
        this.bestFitness = this.individuals[i].fitness;
        this.bestIndex = i;
      }
    }
  }

  /**
   * Tournament selection: popsize tournaments of size s, each winner = lower fitness.
   */
  selectTournament(rng: Rng, s: number = TOURNAMENT_SIZE): Chromosome[] {
    const pop = this.individuals;
    const size = pop.length;
    const result: Chromosome[] = [];
    for (let i = 0; i < size; i++) {
      const perm = randomPermutation(size, rng);
      let bestIdx = perm[0];
      for (let k = 1; k < s; k++) {
        const j = perm[k];
        if (pop[j].fitness <= pop[bestIdx].fitness) bestIdx = j;
      }
      result.push(pop[bestIdx].copy());
    }
    return result;
  }

  /**
   * Single-point crossover on pairs (0,1), (2,3), ... with probability pcross.
   * Replaces this.individuals with the new offspring.
   */
  crossover(pcross: number, rng: Rng): void {
    const n = this.rectangles.length;
    const pop = this.individuals;
    const next: Chromosome[] = [];
    for (let i = 0; i < pop.length; i += 2) {
      const mate1 = pop[i];
      const mate2 = pop[i + 1];
      if (mate2 === undefined) {
        next.push(mate1.copy());
        break;
      }
      if (rng.uniformInt(1000) / 1000 < pcross) {
        const [c1, c2] = crossoverPair(mate1, mate2, n, rng);
        next.push(c1, c2);
      } else {
        next.push(mate1.copy(), mate2.copy());
      }
    }
    this.individuals = next;
  }

  /**
   * Mutation: each gene flips sign with probability pmute.
   */
  mutate(pmute: number, rng: Rng): void {
    for (const ch of this.individuals) {
      for (let j = 0; j < ch.genes.length; j++) {
        if (rng.uniformInt(1000) / 1000 < pmute) {
          ch.genes[j] = -ch.genes[j];
        }
      }
    }
  }
}

/**
 * Single-point crossover: q = random 1..n. Child1 = mate1[0..q-1] + mate2 rest by order; Child2 = mate2[0..q-1] + mate1 rest.
 */
function crossoverPair(
  mate1: Chromosome,
  mate2: Chromosome,
  n: number,
  rng: Rng
): [Chromosome, Chromosome] {
  const q = rng.uniformInt(n) + 1; // 1..n
  const a1 = mate1.genes.slice(0, q);
  const a2 = mate2.genes.slice(0, q);
  const set1 = new Set(a1.map((g) => Math.abs(g)));
  const set2 = new Set(a2.map((g) => Math.abs(g)));
  for (let j = 0; j < n; j++) {
    const g2 = mate2.genes[j];
    const abs2 = Math.abs(g2);
    if (!set1.has(abs2)) {
      a1.push(g2);
      set1.add(abs2);
    }
  }
  for (let j = 0; j < n; j++) {
    const g1 = mate1.genes[j];
    const abs1 = Math.abs(g1);
    if (!set2.has(abs1)) {
      a2.push(g1);
      set2.add(abs1);
    }
  }
  return [new Chromosome(a1), new Chromosome(a2)];
}
