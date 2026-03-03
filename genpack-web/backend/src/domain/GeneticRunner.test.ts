import { GeneticRunner } from './GeneticRunner';
import { parseFileContent } from '../services/ParseService';

describe('GeneticRunner', () => {
  const minimalInput = parseFileContent(
    `GENPACK1
3
10
5 3
4 2
3 2`
  );
  expect(minimalInput.valid).toBe(true);

  it('run returns RunResult with all fields', () => {
    const runner = new GeneticRunner(minimalInput.input!, { seed: 123 });
    const result = runner.run();
    expect(result.packingHeight).toBeGreaterThan(0);
    expect(result.areaWasted).toBeGreaterThanOrEqual(0);
    expect(result.utilizationFactor).toBeGreaterThan(0);
    expect(result.utilizationFactor).toBeLessThanOrEqual(1);
    expect(result.placements.length).toBeGreaterThan(0);
  });

  it('run with same seed produces same result', () => {
    const r1 = new GeneticRunner(minimalInput.input!, { seed: 456 }).run();
    const r2 = new GeneticRunner(minimalInput.input!, { seed: 456 }).run();
    expect(r1.packingHeight).toBe(r2.packingHeight);
    expect(r1.placements.length).toBe(r2.placements.length);
  });

  it('run with includeGenerationReports includes reports', () => {
    const input = minimalInput.input!;
    const runner = new GeneticRunner(
      { ...input, maxGen: 5 },
      { seed: 789 }
    );
    const result = runner.run({ includeGenerationReports: true });
    expect(result.generationReports).toBeDefined();
    expect(result.generationReports!.length).toBe(4); // maxGen-1 generations
    expect(result.generationReports![0]).toMatchObject({
      generation: 1,
      bestHeight: expect.any(Number),
      bestIndex: expect.any(Number),
    });
  });
});
