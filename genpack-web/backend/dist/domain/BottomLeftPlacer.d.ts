import type { Rect } from './Rect';
import type { PlacedRect } from './PlacedRect';
export interface PlaceResult {
    height: number;
    placements: PlacedRect[];
}
/**
 * Bottom-left fill placer. Uses pivot list and mirrors C logic:
 * inplace, choosepivot, pivot_status (pflag 0-5), checkx, checky, ch, px.
 * Origin (0,0) = top-left of stock; y increases downward.
 */
export declare class BottomLeftPlacer {
    private readonly stockWidth;
    private readonly ly;
    private pivots;
    private chosen;
    constructor(stockWidth: number);
    /**
     * Seed pivots along the left edge: (0, 0), (0, 1), ... (0, 2*stockWidth-1).
     */
    private seedPivots;
    /** Sort pivots by (sy, sx) ascending — bottom-left order. */
    private sortPivots;
    /**
     * Find first live pivot that fits rect (avaly >= rect.width, avalx >= rect.length).
     * Sets this.chosen to a copy of that pivot; returns pivot index or -1.
     */
    private choosePivot;
    private get count();
    private px;
    /**
     * checkx(ww): update pivots' avalx / isalive in x-direction.
     * In C, uses p[count] (the newly added pivot) in the first loop; chosen in the second.
     * newPivot must be the pivot just pushed (right or top of placed rect) before calling.
     */
    private checkx;
    /**
     * checky(ww): update pivots' avaly / isalive in y-direction.
     * In C uses p[count] (the newly added pivot) for position/parent; chosen for placed rect bounds.
     * newPivot must be the pivot just pushed (first new one, to the right of placed rect).
     */
    private checky;
    private ch;
    private pivotStatus;
    /**
     * Place all rectangles in order. Each rect should already be normalized (length >= width).
     * Returns packing height (y-extent from ly) and list of placements for graphics.
     */
    place(orderedRects: Rect[]): PlaceResult;
}
//# sourceMappingURL=BottomLeftPlacer.d.ts.map