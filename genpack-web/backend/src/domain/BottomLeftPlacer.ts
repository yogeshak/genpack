import type { Rect } from './Rect';
import type { PlacedRect } from './PlacedRect';
import { Pivot } from './Pivot';

export interface PlaceResult {
  height: number;
  placements: PlacedRect[];
}

/**
 * Bottom-left fill placer. Uses pivot list and mirrors C logic:
 * inplace, choosepivot, pivot_status (pflag 0-5), checkx, checky, ch, px.
 * Origin (0,0) = top-left of stock; y increases downward.
 */
export class BottomLeftPlacer {
  private readonly stockWidth: number;
  private readonly ly = 0;
  private pivots: Pivot[] = [];
  private chosen: Pivot | null = null;

  constructor(stockWidth: number) {
    if (stockWidth <= 0) throw new Error('stockWidth must be positive');
    this.stockWidth = stockWidth;
  }

  /**
   * Seed pivots along the left edge: (0, 0), (0, 1), ... (0, 2*stockWidth-1).
   */
  private seedPivots(): void {
    this.pivots = [];
    const n = Math.floor(2 * this.stockWidth);
    for (let i = 0; i < n; i++) {
      this.pivots.push(
        new Pivot(
          0,
          this.ly + i,
          this.stockWidth,
          2 * this.stockWidth - i,
          2
        )
      );
    }
  }

  /** Sort pivots by (sy, sx) ascending — bottom-left order. */
  private sortPivots(): void {
    this.pivots.sort((a, b) => {
      if (a.sy !== b.sy) return a.sy - b.sy;
      return a.sx - b.sx;
    });
  }

  /**
   * Find first live pivot that fits rect (avaly >= rect.width, avalx >= rect.length).
   * Sets this.chosen to a copy of that pivot; returns pivot index or -1.
   */
  private choosePivot(rect: Rect): number {
    this.sortPivots();
    for (let i = 0; i < this.pivots.length; i++) {
      const pt = this.pivots[i];
      if (pt.avaly >= rect.width && pt.avalx >= rect.length && pt.isalive === 0) {
        this.chosen = pt.clone();
        return i;
      }
    }
    return -1;
  }

  private get count(): number {
    return this.pivots.length;
  }

  private px(pPos: number): number {
    const p = this.pivots;
    for (let l = 0; l < pPos; l++) {
      if (p[l].parent === p[pPos].parent && p[l].which === 0 && p[l].isalive === 1) {
        return l;
      }
    }
    return pPos;
  }

  /**
   * checkx(ww): update pivots' avalx / isalive in x-direction.
   * In C, uses p[count] (the newly added pivot) in the first loop; chosen in the second.
   * newPivot must be the pivot just pushed (right or top of placed rect) before calling.
   */
  private checkx(placedRect: Rect, chosenPivot: Pivot, newPivot: Pivot): void {
    const p = this.pivots;
    const count = p.length;
    const rightX = chosenPivot.sx + placedRect.length;
    const bottomY = chosenPivot.sy + placedRect.width;

    for (let l = 0; l < count; l++) {
      if (newPivot.sy > p[l].sy && newPivot.sx > p[l].sx && p[l].ischeckx === 0) {
        p[l].avalx = newPivot.sx - p[l].sx;
        p[l].ischeckx = 1;
      }
      if (newPivot.sy > p[l].sy && newPivot.sx === p[l].sx && p[l].ischeckx === 0) {
        p[l].isalive = 1;
        p[l].ischeckx = 1;
      }
    }
    for (let l = 0; l < count; l++) {
      if (bottomY > p[l].sy && p[l].ischeckx === 1 && chosenPivot.sx > p[l].sx && chosenPivot.sx < p[l].sx + p[l].avalx) {
        p[l].avalx = chosenPivot.sx - p[l].sx;
      }
      if (bottomY > p[l].sy && p[l].ischeckx === 1 && chosenPivot.sx === p[l].sx && chosenPivot.sx < p[l].sx + p[l].avalx) {
        p[l].isalive = 1;
      }
    }
  }

  /**
   * checky(ww): update pivots' avaly / isalive in y-direction.
   * In C uses p[count] (the newly added pivot) for position/parent; chosen for placed rect bounds.
   * newPivot must be the pivot just pushed (first new one, to the right of placed rect).
   */
  private checky(placedRect: Rect, chosenPivot: Pivot, newPivot: Pivot): void {
    const p = this.pivots;
    const count = p.length;
    const rightX = chosenPivot.sx + placedRect.length;
    const parentLeft = newPivot.sx - placedRect.length; // p[count].sx - sor[p[count].parent].len

    for (let l = 0; l < count; l++) {
      if (newPivot.sy >= p[l].sy && newPivot.sx > p[l].sx && p[l].ischecky === 0) {
        if (p[l].sx >= parentLeft && newPivot.sy > p[l].sy) {
          p[l].avaly = p[l].avaly - placedRect.width;
          p[l].ischecky = 1;
        }
        if (p[l].sy === newPivot.sy && newPivot.sx > p[l].sx && p[l].ischecky === 0 && p[l].sx >= parentLeft) {
          p[l].isalive = 1;
        }
      }
    }
    for (let l = 0; l < count; l++) {
      if (rightX >= p[l].sx && chosenPivot.sy > p[l].sy && p[l].ischecky === 1 && chosenPivot.sy < p[l].sy + p[l].avaly && p[l].sx >= parentLeft) {
        p[l].avaly = chosenPivot.sy - p[l].sy;
      }
      if (rightX >= p[l].sx && chosenPivot.sy === p[l].sy && p[l].ischecky === 1 && chosenPivot.sy < p[l].sy + p[l].avaly && p[l].sx >= parentLeft) {
        p[l].isalive = 1;
      }
    }
  }

  private ch(pPos: number, rePos: number, orderedRects: Rect[]): void {
    const p = this.pivots;
    const l = this.px(pPos);
    const pforIdx = p[l].pfor;
    if (pforIdx < 0) return;
    const parentRect = orderedRects[p[pPos].parent];
    const placedRect = orderedRects[rePos];
    const pforRect = orderedRects[pforIdx];
    if (!parentRect || !pforRect) return;
    if (parentRect.width !== pforRect.width) return;

    const newP = new Pivot(
      p[pPos].sx + placedRect.length,
      p[pPos].sy,
      p[pPos].avalx - placedRect.length,
      p[pPos].avaly,
      0
    );
    newP.parent = rePos;
    newP.ischeckx = p[pPos].ischeckx;
    newP.ischecky = p[pPos].ischecky;
    this.pivots.push(newP);
  }

  private pivotStatus(
    pflag: number,
    pPos: number,
    rePos: number,
    orderedRects: Rect[]
  ): void {
    const p = this.pivots;
    const chosenPivot = this.chosen!;
    const placedRect = orderedRects[rePos];
    const parentRect = orderedRects[p[pPos].parent];

    const pushPivot = (sx: number, sy: number, avalx: number, avaly: number, which: number, parent: number) => {
      const n = new Pivot(sx, sy, avalx, avaly, which);
      n.parent = parent;
      n.ischeckx = p[pPos].ischeckx;
      n.ischecky = p[pPos].ischecky;
      this.pivots.push(n);
    };

    const lastPivot = () => this.pivots[this.pivots.length - 1]!;

    switch (pflag) {
      case 0: {
        pushPivot(
          p[pPos].sx + placedRect.length,
          p[pPos].sy,
          p[pPos].avalx - placedRect.length,
          p[pPos].avaly,
          0,
          rePos
        );
        this.checky(placedRect, chosenPivot, lastPivot());
        pushPivot(
          p[pPos].sx,
          p[pPos].sy + placedRect.width,
          p[pPos].avalx,
          p[pPos].avaly - placedRect.width,
          1,
          rePos
        );
        break;
      }
      case 1: {
        pushPivot(
          p[pPos].sx + placedRect.length,
          p[pPos].sy,
          p[pPos].avalx - placedRect.length,
          p[pPos].avaly,
          0,
          rePos
        );
        this.checky(placedRect, chosenPivot, lastPivot());
        break;
      }
      case 2: {
        pushPivot(
          p[pPos].sx + placedRect.length,
          p[pPos].sy,
          p[pPos].avalx - placedRect.length,
          p[pPos].avaly,
          0,
          rePos
        );
        this.checky(placedRect, chosenPivot, lastPivot());
        pushPivot(
          p[pPos].sx,
          p[pPos].sy + placedRect.width,
          p[pPos].avalx,
          p[pPos].avaly - placedRect.width,
          1,
          rePos
        );
        this.checkx(placedRect, chosenPivot, lastPivot());
        break;
      }
      case 3: {
        pushPivot(
          p[pPos].sx + placedRect.length,
          p[pPos].sy,
          p[pPos].avalx - placedRect.length,
          p[pPos].avaly,
          0,
          rePos
        );
        this.checky(placedRect, chosenPivot, lastPivot());
        pushPivot(
          p[pPos].sx,
          p[pPos].sy + placedRect.width,
          p[pPos].avalx,
          p[pPos].avaly - placedRect.width,
          1,
          rePos
        );
        this.checkx(placedRect, chosenPivot, lastPivot());
        break;
      }
      case 4: {
        pushPivot(
          p[pPos].sx,
          p[pPos].sy + placedRect.width,
          p[pPos].avalx,
          p[pPos].avaly - placedRect.width,
          1,
          rePos
        );
        this.checkx(placedRect, chosenPivot, lastPivot());
        this.ch(pPos, rePos, orderedRects);
        break;
      }
      case 5: {
        for (let i = 0; i < this.count; i++) {
          if (p[i].which === 2 && p[i].sy <= p[pPos].sy + placedRect.width && p[i].sy > p[pPos].sy) {
            p[i].isalive = 1;
          }
        }
        pushPivot(
          p[pPos].sx + placedRect.length,
          p[pPos].sy,
          p[pPos].avalx - placedRect.length,
          p[pPos].avaly,
          0,
          rePos
        );
        this.checky(placedRect, chosenPivot, lastPivot());
        pushPivot(
          p[pPos].sx,
          p[pPos].sy + placedRect.width,
          p[pPos].avalx,
          p[pPos].avaly - placedRect.width,
          2,
          rePos
        );
        this.checkx(placedRect, chosenPivot, lastPivot());
        break;
      }
    }
  }

  /**
   * Place all rectangles in order. Each rect should already be normalized (length >= width).
   * Returns packing height (y-extent from ly) and list of placements for graphics.
   */
  place(orderedRects: Rect[]): PlaceResult {
    this.seedPivots();
    const placements: PlacedRect[] = [];
    let height = 0;
    const ly = this.ly;

    for (let is = 0; is < orderedRects.length; is++) {
      const rect = orderedRects[is];
      const k = this.choosePivot(rect);
      if (k < 0) break;

      const chosenPivot = this.chosen!;
      this.pivots[k].isalive = 1;
      const h = chosenPivot.sy + rect.width - ly;
      if (height < h) height = h;
      this.pivots[k].pfor = is;

      placements.push({
        id: rect.id,
        x: chosenPivot.sx,
        y: chosenPivot.sy,
        width: rect.length,
        height: rect.width,
        label: String(rect.id + 1),
        sequence: is + 1,
      });

      let pflag: number;
      if (this.pivots[k].which === 0) {
        const parentW = orderedRects[this.pivots[k].parent].width;
        if (parentW > rect.width) pflag = 0;
        else if (parentW === rect.width) pflag = 1;
        else pflag = 2;
      } else if (this.pivots[k].which === 1) {
        const parentL = orderedRects[this.pivots[k].parent].length;
        if (parentL !== rect.length) pflag = 3;
        else pflag = 4;
      } else {
        pflag = 5;
      }

      this.pivotStatus(pflag, k, is, orderedRects);
    }

    return { height, placements };
  }
}
