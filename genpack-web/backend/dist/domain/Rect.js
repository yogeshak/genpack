"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalized = normalized;
exports.area = area;
exports.perimeter = perimeter;
/**
 * Returns a new Rect with length >= width (normalized for BLF).
 * Caller may use this when rotation is applied.
 */
function normalized(rect) {
    const len = rect.length;
    const wid = rect.width;
    if (len >= wid)
        return { ...rect, length: len, width: wid };
    return { ...rect, length: wid, width: len };
}
function area(rect) {
    return rect.length * rect.width;
}
function perimeter(rect) {
    return 2 * (rect.length + rect.width);
}
//# sourceMappingURL=Rect.js.map