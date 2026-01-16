import { describe, it, expect } from 'vitest';
import { getDate, getSeconds } from '../date';

describe('date utils', () => {
  describe('getDate', () => {
    it('should format date correctly', () => {
      const timestamp = new Date('2024-01-01 12:00:00').getTime();
      expect(getDate(timestamp)).toBe('2024-01-01 12:00:00');
    });

    it('should pad single digits with zero', () => {
      const timestamp = new Date('2024-05-05 05:05:05').getTime();
      expect(getDate(timestamp)).toBe('2024-05-05 05:05:05');
    });
  });

  describe('getSeconds', () => {
    it('should return difference in seconds', () => {
      const t1 = 10000;
      const t2 = 5000;
      expect(getSeconds(t1, t2)).toBe(5);
    });

    it('should handle arguments in any order', () => {
      const t1 = 5000;
      const t2 = 10000;
      expect(getSeconds(t1, t2)).toBe(5);
    });

    it('should floor the result', () => {
      const t1 = 10500;
      const t2 = 5000;
      expect(getSeconds(t1, t2)).toBe(5);
    });
  });
});
