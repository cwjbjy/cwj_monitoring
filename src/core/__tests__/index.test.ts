import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Core, { createMonitor } from '../index';
import { EMIT_TYPE } from '../../types/event';

describe('Core', () => {
  const options = {
    url: 'http://localhost:3000/report',
    globalKey: '$testTrack',
  };

  beforeEach(() => {
    vi.stubGlobal('window', {
      navigator: {
        sendBeacon: vi.fn(),
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      screen: {
        width: 1920,
        height: 1080,
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should initialize correctly with options', () => {
    const monitor = new Core(options);
    expect(monitor).toBeDefined();
  });

  it('should register plugins using use()', () => {
    const monitor = new Core(options);
    const mockPlugin = {
      name: 'test-plugin',
      install: vi.fn(),
    };
    monitor.use(mockPlugin);
    // Accessing private pluginMap via any for testing
    expect((monitor as any).pluginMap.has('test-plugin')).toBe(true);
  });

  it('should install plugins and mount global variable on run()', () => {
    const monitor = new Core(options);
    const mockPlugin = {
      name: 'test-plugin',
      install: vi.fn(),
    };
    monitor.use(mockPlugin);
    monitor.run();

    expect(mockPlugin.install).toHaveBeenCalledWith(
      expect.objectContaining({
        emit: expect.any(Function),
        url: options.url,
      }),
    );
    expect((window as any).$testTrack).toBe(monitor);
  });

  it('should uninstall plugins and unmount global variable on stop()', () => {
    const monitor = new Core(options);
    const mockPlugin = {
      name: 'test-plugin',
      install: vi.fn(),
      uninstall: vi.fn(),
    };
    monitor.use(mockPlugin);
    monitor.run();
    monitor.stop();

    expect(mockPlugin.uninstall).toHaveBeenCalled();
    expect((window as any).$testTrack).toBeUndefined();
    expect((monitor as any).pluginMap.size).toBe(0);
  });

  it('should log custom events', () => {
    const monitor = new Core(options);
    const emitSpy = vi.spyOn(monitor, 'emit');
    const data = { event: 'test' };

    monitor.log(data);
    expect(emitSpy).toHaveBeenCalledWith(EMIT_TYPE.CUSTOM, data);

    monitor.log(data, 'custom_type');
    expect(emitSpy).toHaveBeenCalledWith('custom_type', data);
  });

  it('createMonitor should return a Core instance', () => {
    const monitor = createMonitor(options);
    expect(monitor).toBeInstanceOf(Core);
  });
});
