/**
 * Pivot point for bottom-left fill placement.
 * Mirrors C struct pivot: position, available space, flags.
 */
export declare class Pivot {
    sx: number;
    sy: number;
    avalx: number;
    avaly: number;
    isalive: number;
    parent: number;
    which: number;
    ischeckx: number;
    ischecky: number;
    pfor: number;
    constructor(sx: number, sy: number, avalx: number, avaly: number, which: number);
    clone(): Pivot;
}
//# sourceMappingURL=Pivot.d.ts.map