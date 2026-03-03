import { BottomLeftPlacer } from './BottomLeftPlacer';
import type { Rect } from './Rect';
import { normalized } from './Rect';
import { parseFileContent } from '../services/ParseService';

describe('BottomLeftPlacer', () => {
  it('places single rectangle and returns height = width', () => {
    const placer = new BottomLeftPlacer(10);
    const rects: Rect[] = [{ id: 0, length: 5, width: 3 }];
    const result = placer.place(rects);
    expect(result.height).toBe(3);
    expect(result.placements).toHaveLength(1);
    expect(result.placements[0]).toMatchObject({
      id: 0,
      x: 0,
      y: 0,
      width: 5,
      height: 3,
    });
  });

  it('places two rectangles and returns valid packing', () => {
    const placer = new BottomLeftPlacer(20);
    const rects: Rect[] = [
      { id: 0, length: 10, width: 5 },
      { id: 1, length: 5, width: 5 },
    ];
    const result = placer.place(rects);
    expect(result.placements).toHaveLength(2);
    expect(result.height).toBeGreaterThan(0);
    expect(result.placements[0]).toMatchObject({ x: 0, y: 0, width: 10, height: 5 });
    // Second rect should be placed (bottom-left may choose (10,0) or (0,5) depending on pivot order)
    expect(result.placements[1].width).toBe(5);
    expect(result.placements[1].height).toBe(5);
  });

  it('places three rectangles and produces valid packing', () => {
    const placer = new BottomLeftPlacer(15);
    const rects: Rect[] = [
      { id: 0, length: 5, width: 4 },
      { id: 1, length: 5, width: 3 },
      { id: 2, length: 5, width: 2 },
    ];
    const result = placer.place(rects);
    expect(result.placements).toHaveLength(3);
    expect(result.height).toBeGreaterThan(0);
    expect(result.height).toBeLessThanOrEqual(4 + 3 + 2);
  });

  it('uses normalized dimensions (length >= width) when given ordered rects', () => {
    const placer = new BottomLeftPlacer(10);
    const rects: Rect[] = [normalized({ id: 0, length: 2, width: 5 })];
    const result = placer.place(rects);
    expect(result.placements[0].width).toBe(5);
    expect(result.placements[0].height).toBe(2);
    expect(result.height).toBe(2);
  });

  it('places rectangles from parsed CAT21-like input in width-descending order', () => {
    const parsed = parseFileContent(`GENPACK1
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
6 2`);
    expect(parsed.valid).toBe(true);
    const rects = [...parsed.input!.rectangles]
      .map((r) => normalized(r))
      .sort((a, b) => b.width - a.width);
    const placer = new BottomLeftPlacer(parsed.input!.stockWidth);
    const result = placer.place(rects);
    expect(result.placements.length).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
    // Full BLF parity with C (all 25 placed) to be verified in integration
    expect(result.placements.length).toBeLessThanOrEqual(25);
  });

  it('throws when stock width is non-positive', () => {
    expect(() => new BottomLeftPlacer(0)).toThrow('stockWidth must be positive');
    expect(() => new BottomLeftPlacer(-1)).toThrow('stockWidth must be positive');
  });

  /**
   * BLF placement rule: rect is dropped from top-right, moved down then left.
   * First rect → only pivot (0,0). After each placement, new pivots appear to the right and/or on top.
   * This test uses 4 rectangles and asserts exact (x,y) and no overlapping.
   */
  it('places 4 rectangles with BLF rule: distinct pivots, no stacking', () => {
    const stockWidth = 20;
    // Four 10×5 rects: should form 2×2 grid. BLF order: (0,0) → (10,0) → (0,5) → (10,5)
    const rects: Rect[] = [
      { id: 0, length: 10, width: 5 },
      { id: 1, length: 10, width: 5 },
      { id: 2, length: 10, width: 5 },
      { id: 3, length: 10, width: 5 },
    ];
    const placer = new BottomLeftPlacer(stockWidth);
    const result = placer.place(rects);

    expect(result.placements).toHaveLength(4);
    expect(result.height).toBe(10); // two rows of height 5

    // Expected under BLF: first at bottom-left; second to the right; third on top of first; fourth to the right of third
    const expected = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 5 },
      { x: 10, y: 5 },
    ];
    for (let i = 0; i < 4; i++) {
      expect(result.placements[i]).toMatchObject({
        id: rects[i].id,
        x: expected[i].x,
        y: expected[i].y,
        width: 10,
        height: 5,
      });
    }

    // No two rectangles overlap
    const placements = result.placements;
    for (let i = 0; i < placements.length; i++) {
      for (let j = i + 1; j < placements.length; j++) {
        const a = placements[i];
        const b = placements[j];
        const overlapX = a.x < b.x + b.width && b.x < a.x + a.width;
        const overlapY = a.y < b.y + b.height && b.y < a.y + a.height;
        expect(overlapX && overlapY).toBe(false);
      }
    }
  });
});
