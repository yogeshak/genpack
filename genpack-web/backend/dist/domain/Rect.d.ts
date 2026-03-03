/**
 * One rectangular part (read-only dimensions).
 * id is the original 0-based index from the input file.
 */
export interface Rect {
    readonly id: number;
    readonly length: number;
    readonly width: number;
}
/**
 * Returns a new Rect with length >= width (normalized for BLF).
 * Caller may use this when rotation is applied.
 */
export declare function normalized(rect: Rect): Rect;
export declare function area(rect: Rect): number;
export declare function perimeter(rect: Rect): number;
//# sourceMappingURL=Rect.d.ts.map