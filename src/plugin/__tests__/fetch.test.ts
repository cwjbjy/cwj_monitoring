import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FetchPlugin } from '../fetch';
import { EMIT_TYPE } from '../../types/event';

describe('FetchPlugin', () => {
  let context: any;
  const originalFetch = global.fetch;

  beforeEach(() => {
    context = {
      emit: vi.fn(),
      url: 'http://localhost:3000/report',
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should intercept successful fetch requests but not emit', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      url: 'http://api.example.com/data',
    });
    const plugin = FetchPlugin();
    plugin.install(context);

    await fetch('http://api.example.com/data');

    expect(context.emit).not.toHaveBeenCalled();
    plugin.uninstall?.();
  });

  it('should intercept failed fetch requests (status >= 400)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      url: 'http://api.example.com/data',
    });
    const plugin = FetchPlugin();
    plugin.install(context);

    await fetch('http://api.example.com/data', { method: 'POST' });

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.FETCH,
      expect.objectContaining({
        url: 'http://api.example.com/data',
        method: 'POST',
        status: 404,
        success: false,
      }),
    );
    plugin.uninstall?.();
  });

  it('should intercept fetch network errors', async () => {
    const error = new Error('Network Error');
    global.fetch = vi.fn().mockRejectedValue(error);
    const plugin = FetchPlugin();
    plugin.install(context);

    try {
      await fetch('http://api.example.com/data');
    } catch (e) {
      // expected
    }

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.FETCH,
      expect.objectContaining({
        url: 'http://api.example.com/data',
        status: 0,
        success: false,
        message: 'Network Error',
      }),
    );
    plugin.uninstall?.();
  });

  it('should ignore report URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      url: context.url,
    });
    const plugin = FetchPlugin();
    plugin.install(context);

    await fetch(context.url);

    expect(context.emit).not.toHaveBeenCalled();
    plugin.uninstall?.();
  });

  it('should respect filter option', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      url: 'http://api.example.com/data',
    });
    const filter = vi.fn().mockReturnValue(false);
    const plugin = FetchPlugin({ filter });
    plugin.install(context);

    await fetch('http://api.example.com/data');

    expect(filter).toHaveBeenCalled();
    expect(context.emit).not.toHaveBeenCalled();
    plugin.uninstall?.();
  });
});
