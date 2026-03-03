import { Chromosome } from './Chromosome';
import type { Rect } from './Rect';

describe('Chromosome', () => {
  const rects: Rect[] = [
    { id: 0, length: 5, width: 3 },
    { id: 1, length: 4, width: 2 },
  ];

  it('copy returns independent chromosome', () => {
    const c = new Chromosome([1, 2], 10);
    const d = c.copy();
    expect(d.genes).toEqual([1, 2]);
    expect(d.fitness).toBe(10);
    d.genes[0] = 2;
    expect(c.genes[0]).toBe(1);
  });

  it('toOrderedRects returns rects in gene order with rotation applied', () => {
    const c = new Chromosome([1, -2]); // genes 1-based: 1 = rect 0 no rot, -2 = rect 1 rotated 90°
    const ordered = c.toOrderedRects(rects);
    expect(ordered).toHaveLength(2);
    expect(ordered[0]).toMatchObject({ id: 0, length: 5, width: 3 });
    // Rotated: original 4×2 → length 2, width 4 (placed with short side along strip)
    expect(ordered[1]).toMatchObject({ id: 1, length: 2, width: 4 });
  });

  it('length returns genes length', () => {
    const c = new Chromosome([1, 2, 3]);
    expect(c.length).toBe(3);
  });
});
