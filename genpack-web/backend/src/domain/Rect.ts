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
export function normalized(rect: Rect): Rect {
  const len = rect.length;
  const wid = rect.width;
  if (len >= wid) return { ...rect, length: len, width: wid };
  return { ...rect, length: wid, width: len };
}

export function area(rect: Rect): number {
  return rect.length * rect.width;
}

export function perimeter(rect: Rect): number {
  return 2 * (rect.length + rect.width);
}
