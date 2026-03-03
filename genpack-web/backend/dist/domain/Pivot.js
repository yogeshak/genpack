"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pivot = void 0;
/**
 * Pivot point for bottom-left fill placement.
 * Mirrors C struct pivot: position, available space, flags.
 */
class Pivot {
    constructor(sx, sy, avalx, avaly, which) {
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
    clone() {
        const p = new Pivot(this.sx, this.sy, this.avalx, this.avaly, this.which);
        p.isalive = this.isalive;
        p.parent = this.parent;
        p.ischeckx = this.ischeckx;
        p.ischecky = this.ischecky;
        p.pfor = this.pfor;
        return p;
    }
}
exports.Pivot = Pivot;
//# sourceMappingURL=Pivot.js.map