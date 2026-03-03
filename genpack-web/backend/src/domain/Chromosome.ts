import type { Rect } from './Rect';
import { normalized } from './Rect';

/**
 * Chromosome: ordering of rectangle indices; sign = rotation (negative = rotate 90°).
 * Genes are 1-based: 1..n or -1..-n. id = Math.abs(g) - 1. Negative = rotate 90°.
 */
export class Chromosome {
  /** Signed 1-based indices: positive = no rotation, negative = rotate 90° */
  readonly genes: number[];
  /** Packing height (fitness); set after decode. Lower is better. */
  fitness: number;

  constructor(genes: number[], fitness = 0) {
    this.genes = [...genes];
    this.fitness = fitness;
  }

  copy(): Chromosome {
    return new Chromosome(this.genes, this.fitness);
  }

  /**
   * Build ordered list of rects for BLF: apply rotation. Placer uses length = horizontal, width = vertical.
   * Negative gene = rotate 90° (place width along strip, length vertical). Do not normalize rotated rects
   * or we would undo the rotation (normalized enforces length >= width and would swap back).
   */
  toOrderedRects(rectangles: readonly Rect[]): Rect[] {
    return this.genes.map((g) => {
      const id = Math.abs(g) - 1;
      const rect = rectangles[id];
      if (g < 0) {
        return { ...rect, length: rect.width, width: rect.length };
      }
      return normalized(rect);
    });
  }

  /** Number of items (genes length). */
  get length(): number {
    return this.genes.length;
  }
}
