import { HeuristicSolver, type HeuristicMethod } from './HeuristicSolver';
import { parseFileContent } from '../services/ParseService';

const parsed = parseFileContent(
  `GENPACK1
4
12
6 4
5 3
4 3
3 2`
);
expect(parsed.valid).toBe(true);
const input = parsed.input!;

describe('HeuristicSolver', () => {
  const methods: HeuristicMethod[] = ['length', 'width', 'area', 'perimeter'];

  methods.forEach((method) => {
    it(`${method} returns RunResult with placements`, () => {
      const result = HeuristicSolver.run(input, method);
      expect(result.packingHeight).toBeGreaterThan(0);
      expect(result.areaWasted).toBeGreaterThanOrEqual(0);
      expect(result.utilizationFactor).toBeGreaterThan(0);
      expect(result.utilizationFactor).toBeLessThanOrEqual(1);
      expect(result.placements.length).toBeGreaterThan(0);
      expect(result.generationReports).toBeUndefined();
    });
  });

  it('byLength returns deterministic result', () => {
    const a = HeuristicSolver.byLength(input);
    const b = HeuristicSolver.byLength(input);
    expect(a.packingHeight).toBe(b.packingHeight);
  });

  it('byWidth can differ from byLength', () => {
    const byLen = HeuristicSolver.byLength(input);
    const byWid = HeuristicSolver.byWidth(input);
    expect(byLen.placements.length).toBe(input.itemCount);
    expect(byWid.placements.length).toBe(input.itemCount);
  });
});
