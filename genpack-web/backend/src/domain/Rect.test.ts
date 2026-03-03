import { normalized, area, perimeter } from './Rect';

describe('Rect', () => {
  describe('normalized', () => {
    it('returns same rect when length >= width', () => {
      const r = { id: 0, length: 5, width: 3 };
      expect(normalized(r)).toEqual({ id: 0, length: 5, width: 3 });
    });

    it('swaps length and width when width > length', () => {
      const r = { id: 0, length: 3, width: 5 };
      expect(normalized(r)).toEqual({ id: 0, length: 5, width: 3 });
    });

    it('preserves id', () => {
      const r = { id: 42, length: 1, width: 2 };
      expect(normalized(r).id).toBe(42);
    });
  });

  describe('area', () => {
    it('returns length * width', () => {
      expect(area({ id: 0, length: 4, width: 3 })).toBe(12);
    });
  });

  describe('perimeter', () => {
    it('returns 2*(length + width)', () => {
      expect(perimeter({ id: 0, length: 4, width: 3 })).toBe(14);
    });
  });
});
