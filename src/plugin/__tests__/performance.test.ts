import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerformancePlugin } from '../performance';
import { EMIT_TYPE } from '../../types/event';

describe('PerformancePlugin', () => {
  let context: any;
  let observers: any[] = [];

  beforeEach(() => {
    context = {
      emit: vi.fn(),
    };
    observers = [];

    // Mock PerformanceObserver as a class
    class MockPerformanceObserver {
      callback: any;
      constructor(callback: any) {
        this.callback = callback;
        observers.push(this);
      }
      observe = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn();
    }

    global.PerformanceObserver = MockPerformanceObserver as any;
    // @ts-ignore
    global.PerformanceObserver.supportedEntryTypes = [
      'paint',
      'largest-contentful-paint',
      'resource',
      'long-animation-frame',
    ];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const triggerObservers = (entries: any[]) => {
    observers.forEach((obs) => {
      obs.callback({
        getEntries: () => entries,
      });
    });
  };

  it('should monitor paint metrics', () => {
    const plugin = PerformancePlugin();
    plugin.install(context);

    triggerObservers([
      { entryType: 'paint', name: 'first-paint', startTime: 100 },
      { entryType: 'paint', name: 'first-contentful-paint', startTime: 200 },
    ]);

    expect(context.emit).toHaveBeenCalledWith(EMIT_TYPE.PERFORMANCE_FP, 100);
    expect(context.emit).toHaveBeenCalledWith(EMIT_TYPE.PERFORMANCE_FCP, 200);
  });

  it('should monitor LCP', () => {
    const plugin = PerformancePlugin();
    plugin.install(context);

    triggerObservers([{ entryType: 'largest-contentful-paint', startTime: 300, size: 1000, url: 'img.png' }]);

    expect(context.emit).toHaveBeenCalledWith(EMIT_TYPE.PERFORMANCE_LCP, 300);
  });

  it('should monitor resources', () => {
    const plugin = PerformancePlugin({ resourceThreshold: 50 });
    plugin.install(context);

    triggerObservers([
      {
        entryType: 'resource',
        name: 'http://example.com/script.js',
        duration: 100,
        transferSize: 1000,
        initiatorType: 'fetch',
        startTime: 100,
        responseEnd: 200,
      },
    ]);

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.PERFORMANCE_RESOURCE,
      expect.objectContaining({
        name: 'http://example.com/script.js',
        duration: 100,
      }),
    );
  });

  it('should monitor LoAF', async () => {
    const plugin = PerformancePlugin({ loafThreshold: 50 });
    plugin.install(context);

    // Mock fetch for LoAF context extraction
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('console.log("hello")'),
    });

    triggerObservers([
      {
        entryType: 'long-animation-frame',
        duration: 100,
        startTime: 1000,
        renderStart: 1050,
        styleAndLayoutStart: 1060,
        hadRecentInput: false,
        scripts: [
          {
            duration: 60,
            invoker: 'click',
            sourceURL: 'app.js',
            invokerType: 'user-callback',
            startTime: 1010,
            sourceCharPosition: 10,
          },
        ],
      },
    ]);

    // LoAF emission is async due to fetch
    await vi.waitFor(() => {
      expect(context.emit).toHaveBeenCalledWith(
        EMIT_TYPE.PERFORMANCE_LOAF,
        expect.objectContaining({
          duration: 100,
        }),
      );
    });
  });

  it('should disconnect observers on uninstall', () => {
    const plugin = PerformancePlugin();
    plugin.install(context);

    expect(observers.length).toBeGreaterThan(0);

    plugin.uninstall?.();

    observers.forEach((obs) => {
      expect(obs.disconnect).toHaveBeenCalled();
    });
  });
});
