import { Population } from './Population';
import { seededRng } from '../util/Rng';

describe('Population', () => {
  const rectangles = [
    { id: 0, length: 5, width: 3 },
    { id: 1, length: 4, width: 2 },
    { id: 2, length: 3, width: 2 },
  ];
  const stockWidth = 10;
  const rng = seededRng(42);

  it('initializes with correct size and first 4 heuristic', () => {
    const pop = new Population(6, stockWidth, rectangles, rng);
    expect(pop.individuals).toHaveLength(6);
    expect(pop.individuals[0].genes).toHaveLength(3);
    pop.evaluateAll();
    expect(pop.individuals[0].fitness).toBeGreaterThan(0);
  });

  it('updateBest sets bestIndex and bestFitness', () => {
    const pop = new Population(4, stockWidth, rectangles, rng);
    pop.evaluateAll();
    pop.updateBest();
    expect(pop.bestIndex).toBeGreaterThanOrEqual(0);
    expect(pop.bestIndex).toBeLessThan(4);
    expect(pop.bestFitness).toBeGreaterThan(0);
    expect(pop.bestFitness).toBe(pop.individuals[pop.bestIndex].fitness);
  });

  it('selectTournament returns population size chromosomes', () => {
    const pop = new Population(4, stockWidth, rectangles, rng);
    pop.evaluateAll();
    const selected = pop.selectTournament(seededRng(99));
    expect(selected).toHaveLength(4);
    selected.forEach((ch) => expect(ch.genes).toHaveLength(3));
  });

  it('crossover produces valid chromosomes (all indices present)', () => {
    const pop = new Population(4, stockWidth, rectangles, rng);
    pop.evaluateAll();
    const selected = pop.selectTournament(seededRng(99));
    pop.individuals = selected;
    pop.crossover(0.0, rng); // no crossover: copies
    expect(pop.individuals).toHaveLength(4);
    pop.individuals.forEach((ch) => {
      const ids = new Set(ch.genes.map((g) => Math.abs(g)));
      expect(ids.size).toBe(3);
      expect(ids.has(1)).toBe(true);
      expect(ids.has(2)).toBe(true);
      expect(ids.has(3)).toBe(true);
    });
  });

  it('mutate preserves indices, may flip signs', () => {
    const pop = new Population(2, stockWidth, rectangles, rng);
    pop.evaluateAll();
    const before = pop.individuals[0].genes.map((g) => Math.abs(g)).sort((a, b) => a - b);
    pop.mutate(1.0, rng); // always flip
    const after = pop.individuals[0].genes.map((g) => Math.abs(g)).sort((a, b) => a - b);
    expect(after).toEqual(before);
  });
});
