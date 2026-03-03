"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chromosome = void 0;
const Rect_1 = require("./Rect");
/**
 * Chromosome: ordering of rectangle indices; sign = rotation (negative = rotate 90°).
 * Genes are 1-based: 1..n or -1..-n. id = Math.abs(g) - 1. Negative = rotate 90°.
 */
class Chromosome {
    constructor(genes, fitness = 0) {
        this.genes = [...genes];
        this.fitness = fitness;
    }
    copy() {
        return new Chromosome(this.genes, this.fitness);
    }
    /**
     * Build ordered list of rects for BLF: apply rotation. Placer uses length = horizontal, width = vertical.
     * Negative gene = rotate 90° (place width along strip, length vertical). Do not normalize rotated rects
     * or we would undo the rotation (normalized enforces length >= width and would swap back).
     */
    toOrderedRects(rectangles) {
        return this.genes.map((g) => {
            const id = Math.abs(g) - 1;
            const rect = rectangles[id];
            if (g < 0) {
                return { ...rect, length: rect.width, width: rect.length };
            }
            return (0, Rect_1.normalized)(rect);
        });
    }
    /** Number of items (genes length). */
    get length() {
        return this.genes.length;
    }
}
exports.Chromosome = Chromosome;
//# sourceMappingURL=Chromosome.js.map