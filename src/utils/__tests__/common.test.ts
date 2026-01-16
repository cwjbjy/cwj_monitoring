import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { throttle, isIgnoredScriptSource } from '../common';

describe('common utils', () => {
  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should throttle function calls', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 1000);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call function again after delay', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 1000);

      throttledFn();
      vi.advanceTimersByTime(1000);
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('isIgnoredScriptSource', () => {
    it('should return true for node_modules sources', () => {
      expect(isIgnoredScriptSource('https://example.com/node_modules/pkg/index.js')).toBe(true);
      expect(isIgnoredScriptSource('/path/to/node_modules/pkg/index.js')).toBe(true);
    });

    it('should return false for non-node_modules sources', () => {
      expect(isIgnoredScriptSource('https://example.com/src/index.js')).toBe(false);
      expect(isIgnoredScriptSource('/path/to/src/index.js')).toBe(false);
    });

    it('should return false for empty or non-string inputs', () => {
      expect(isIgnoredScriptSource('')).toBe(false);
      expect(isIgnoredScriptSource(undefined)).toBe(false);
      // @ts-ignore
      expect(isIgnoredScriptSource(null)).toBe(false);
    });
  });
});
