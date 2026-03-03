/**
 * Pivot point for bottom-left fill placement.
 * Mirrors C struct pivot: position, available space, flags.
 */
export class Pivot {
  sx: number;
  sy: number;
  avalx: number;
  avaly: number;
  isalive: number;
  parent: number;
  which: number;   // 0 = right of rect, 1 = above rect, 2 = initial left edge
  ischeckx: number;
  ischecky: number;
  pfor: number;

  constructor(
    sx: number,
    sy: number,
    avalx: number,
    avaly: number,
    which: number
  ) {
    this.sx = sx;
    this.sy = sy;
    this.avalx = avalx;
    this.avaly = avaly;
    this.which = which;
    this.isalive = 0;
    this.parent = -1;
    this.ischeckx = 0;
    this.ischecky = 0;
    this.pfor = -1;
  }

  clone(): Pivot {
    const p = new Pivot(this.sx, this.sy, this.avalx, this.avaly, this.which);
    p.isalive = this.isalive;
    p.parent = this.parent;
    p.ischeckx = this.ischeckx;
    p.ischecky = this.ischecky;
    p.pfor = this.pfor;
    return p;
  }
}
