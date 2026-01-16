import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PVPlugin } from '../pv';
import { EMIT_TYPE } from '../../types/event';

describe('PVPlugin', () => {
  let context: any;

  beforeEach(() => {
    context = {
      emit: vi.fn(),
    };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should track history pushState', () => {
    const plugin = PVPlugin();
    plugin.install(context);

    window.history.pushState({}, '', '/new-path');

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.ROUTE_CHANGE,
      expect.objectContaining({
        type: 'pushState',
        to: expect.stringContaining('/new-path'),
      }),
    );

    plugin.uninstall?.();
  });

  it('should track history replaceState', () => {
    const plugin = PVPlugin();
    plugin.install(context);

    window.history.replaceState({}, '', '/replaced-path');

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.ROUTE_CHANGE,
      expect.objectContaining({
        type: 'replaceState',
        to: expect.stringContaining('/replaced-path'),
      }),
    );

    plugin.uninstall?.();
  });

  it('should track popstate events', () => {
    const plugin = PVPlugin();
    plugin.install(context);

    const popstateEvent = new PopStateEvent('popstate', { state: {} });
    window.dispatchEvent(popstateEvent);

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.ROUTE_CHANGE,
      expect.objectContaining({
        type: 'popstate',
      }),
    );

    plugin.uninstall?.();
  });

  it('should track hash changes', () => {
    const plugin = PVPlugin();
    plugin.install(context);

    // Manually update the URL so window.location.href is correct
    window.history.pushState({}, '', '#/hash-path');

    // Clear the call from pushState
    context.emit.mockClear();

    const hashEvent = new HashChangeEvent('hashchange');
    window.dispatchEvent(hashEvent);

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.ROUTE_CHANGE,
      expect.objectContaining({
        type: 'hashchange',
        to: expect.stringContaining('#/hash-path'),
      }),
    );

    plugin.uninstall?.();
  });
});
