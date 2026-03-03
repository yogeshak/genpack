"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRng = defaultRng;
exports.seededRng = seededRng;
/**
 * RNG using Math.random() (not reproducible).
 */
function defaultRng() {
    return {
        uniformInt(max) {
            return Math.floor(Math.random() * max);
        },
    };
}
/**
 * Seeded RNG (mulberry32) for reproducible tests.
 */
function seededRng(seed) {
    let state = seed >>> 0;
    return {
        uniformInt(max) {
            state = (state + 0x6d2b79f5) >>> 0; // mulberry32
            const t = Math.imul(state ^ (state >>> 15), 1 | state);
            const u = (t + Math.imul(t ^ (t >>> 7), 61 | (t ^ (t >>> 7)))) ^ t;
            const v = (u >>> 0) / 0xffffffff;
            return Math.floor(v * max);
        },
    };
}
//# sourceMappingURL=Rng.js.map