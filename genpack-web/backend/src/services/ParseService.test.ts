import {
  parseFileContent,
  parseAndValidate,
} from './ParseService';

const VALID_HEADER = 'GENPACK1';
const SAMPLE_MINIMAL = `${VALID_HEADER}
2
10
3 2
4 1`;

const SAMPLE_CAT21_LIKE = `GENPACK1
25
15
11 3
13 3
9 2
7 2
9 3
7 3
11 2
13 2
11 4
13 4
3 5
11 2
2 2
11 3
2 3
5 4
6 4
12 2
1 2
3 5
13 5
12 4
1 4
5 2
6 2`;

describe('ParseService', () => {
  describe('parseFileContent', () => {
    it('parses minimal valid file and returns PackingInput', () => {
      const result = parseFileContent(SAMPLE_MINIMAL);
      expect(result.valid).toBe(true);
      expect(result.input).toBeDefined();
      expect(result.input!.itemCount).toBe(2);
      expect(result.input!.stockWidth).toBe(10);
      expect(result.input!.rectangles).toHaveLength(2);
      expect(result.input!.rectangles[0]).toEqual({ id: 0, length: 3, width: 2 });
      expect(result.input!.rectangles[1]).toEqual({ id: 1, length: 4, width: 1 });
      expect(result.input!.pcross).toBe(0.8);
      expect(result.input!.pmute).toBe(0.1);
      expect(result.input!.maxGen).toBe(100);
      expect(result.input!.populationSize).toBe(20);
    });

    it('accepts custom run parameters', () => {
      const result = parseFileContent(SAMPLE_MINIMAL, {
        pcross: 0.9,
        pmute: 0.05,
        maxGen: 50,
        populationSize: 30,
      });
      expect(result.valid).toBe(true);
      expect(result.input!.pcross).toBe(0.9);
      expect(result.input!.pmute).toBe(0.05);
      expect(result.input!.maxGen).toBe(50);
      expect(result.input!.populationSize).toBe(30);
    });

    it('rejects invalid header', () => {
      const result = parseFileContent('GENPACK2\n1\n10\n1 1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('GENPACK1');
    });

    it('rejects invalid item count (zero)', () => {
      const result = parseFileContent(`${VALID_HEADER}\n0\n10\n1 1`);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('item count');
    });

    it('rejects invalid item count (exceeds max)', () => {
      const result = parseFileContent(`${VALID_HEADER}\n201\n10\n`);
      expect(result.valid).toBe(false);
    });

    it('rejects invalid stock width', () => {
      const result = parseFileContent(`${VALID_HEADER}\n1\n0\n1 1`);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('stock width');
    });

    it('rejects too few rectangle lines', () => {
      const result = parseFileContent(`${VALID_HEADER}\n3\n10\n1 1\n2 2`);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Expected 3 rectangle lines');
    });

    it('rejects invalid rectangle dimension (non-numeric)', () => {
      const result = parseFileContent(`${VALID_HEADER}\n1\n10\nx 1`);
      expect(result.valid).toBe(false);
    });

    it('parses CAT21-like file with 25 items', () => {
      const result = parseFileContent(SAMPLE_CAT21_LIKE);
      expect(result.valid).toBe(true);
      expect(result.input!.itemCount).toBe(25);
      expect(result.input!.stockWidth).toBe(15);
      expect(result.input!.rectangles).toHaveLength(25);
      expect(result.input!.rectangles[0].length).toBe(11);
      expect(result.input!.rectangles[0].width).toBe(3);
    });
  });

  describe('parseAndValidate', () => {
    it('returns valid summary for valid file', () => {
      const result = parseAndValidate(SAMPLE_MINIMAL);
      expect(result.valid).toBe(true);
      expect(result.itemCount).toBe(2);
      expect(result.stockWidth).toBe(10);
    });

    it('returns error for invalid file', () => {
      const result = parseAndValidate('bad');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
