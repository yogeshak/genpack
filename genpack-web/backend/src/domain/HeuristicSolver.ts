import type { PackingInput } from './PackingInput';
import type { RunResult } from './RunResult';
import type { Rect } from './Rect';
import { BottomLeftPlacer } from './BottomLeftPlacer';
import { normalized, area, perimeter } from './Rect';

export type HeuristicMethod = 'length' | 'width' | 'area' | 'perimeter';

function orderByLength(rectangles: readonly Rect[]): Rect[] {
  return [...rectangles].map(normalized).sort((a, b) => b.length - a.length);
}

function orderByWidth(rectangles: readonly Rect[]): Rect[] {
  return [...rectangles].map(normalized).sort((a, b) => b.width - a.width);
}

function orderByArea(rectangles: readonly Rect[]): Rect[] {
  return [...rectangles].map(normalized).sort((a, b) => area(b) - area(a));
}

function orderByPerimeter(rectangles: readonly Rect[]): Rect[] {
  return [...rectangles].map(normalized).sort((a, b) => perimeter(b) - perimeter(a));
}

function runHeuristic(
  stockWidth: number,
  rectangles: readonly Rect[],
  ordered: Rect[]
): RunResult {
  const placer = new BottomLeftPlacer(stockWidth);
  const { height, placements } = placer.place(ordered);
  let totalArea = 0;
  for (const r of rectangles) totalArea += area(r);
  const stripArea = height * stockWidth;
  const areaWasted = stripArea - totalArea;
  const utilizationFactor = totalArea / stripArea;
  return {
    packingHeight: height,
    areaWasted,
    utilizationFactor,
    placements,
  };
}

export class HeuristicSolver {
  static byLength(input: PackingInput): RunResult {
    const ordered = orderByLength(input.rectangles);
    return runHeuristic(input.stockWidth, input.rectangles, ordered);
  }

  static byWidth(input: PackingInput): RunResult {
    const ordered = orderByWidth(input.rectangles);
    return runHeuristic(input.stockWidth, input.rectangles, ordered);
  }

  static byArea(input: PackingInput): RunResult {
    const ordered = orderByArea(input.rectangles);
    return runHeuristic(input.stockWidth, input.rectangles, ordered);
  }

  static byPerimeter(input: PackingInput): RunResult {
    const ordered = orderByPerimeter(input.rectangles);
    return runHeuristic(input.stockWidth, input.rectangles, ordered);
  }

  static run(input: PackingInput, method: HeuristicMethod): RunResult {
    switch (method) {
      case 'length':
        return HeuristicSolver.byLength(input);
      case 'width':
        return HeuristicSolver.byWidth(input);
      case 'area':
        return HeuristicSolver.byArea(input);
      case 'perimeter':
        return HeuristicSolver.byPerimeter(input);
    }
  }
}
