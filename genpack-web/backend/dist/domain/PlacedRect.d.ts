/**
 * One placed rectangle for graphics: position and size in strip coordinates.
 * Origin (0,0) is top-left of stock; y increases downward.
 * width/height are the placed dimensions (length along strip, height vertical).
 */
export interface PlacedRect {
    readonly id: number;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly label?: string;
    /** 1-based placement order */
    readonly sequence?: number;
    /** True if rect was rotated 90° for placement (GA only) */
    readonly rotated?: boolean;
}
//# sourceMappingURL=PlacedRect.d.ts.map