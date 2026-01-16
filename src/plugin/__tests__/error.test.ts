import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorPlugin } from '../error';
import { EMIT_TYPE } from '../../types/event';

describe('ErrorPlugin', () => {
  let context: any;

  beforeEach(() => {
    context = {
      emit: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should capture global errors', () => {
    const plugin = ErrorPlugin();
    plugin.install(context);

    const error = new Error('test error');
    const errorEvent = new ErrorEvent('error', {
      message: 'test error',
      filename: 'test.js',
      lineno: 10,
      colno: 20,
      error: error,
    });
    window.dispatchEvent(errorEvent);

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.ERROR,
      expect.objectContaining({
        type: 'sync',
        errorType: 'js',
        message: 'test error',
        filename: 'test.js',
        lineno: 10,
        colno: 20,
      }),
    );
    plugin.uninstall?.();
  });

  it('should capture unhandled promise rejections', async () => {
    const plugin = ErrorPlugin();
    plugin.install(context);

    const promise = Promise.reject('test rejection');
    promise.catch(() => {});

    const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
      promise: promise,
      reason: 'test rejection',
    });
    window.dispatchEvent(rejectionEvent);

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.ERROR,
      expect.objectContaining({
        type: 'async',
        errorType: 'promise',
        message: 'test rejection',
      }),
    );
    plugin.uninstall?.();
  });

  it('should capture resource load errors', () => {
    const plugin = ErrorPlugin();
    plugin.install(context);

    const target = document.createElement('img');
    Object.defineProperty(target, 'src', { value: 'http://localhost/invalid.png' });
    Object.defineProperty(target, 'tagName', { value: 'IMG' });

    const errorEvent = new Event('error', { bubbles: false });
    Object.defineProperty(errorEvent, 'target', { value: target });

    window.dispatchEvent(errorEvent);

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.ERROR,
      expect.objectContaining({
        type: 'sync',
        errorType: 'resource',
        tagName: 'IMG',
        url: 'http://localhost/invalid.png',
      }),
    );
    plugin.uninstall?.();
  });

  it('should capture console.error', () => {
    const originalConsoleError = console.error;
    const plugin = ErrorPlugin();
    plugin.install(context);

    console.error('test console error', { detail: 'info' });

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.ERROR,
      expect.objectContaining({
        type: 'console',
        message: 'test console error [object Object]',
      }),
    );

    plugin.uninstall?.();
    expect(console.error).toBe(originalConsoleError);
  });

  it('should respect filter option', () => {
    const filter = vi.fn().mockReturnValue(false);
    const plugin = ErrorPlugin({ filter });
    plugin.install(context);

    const errorEvent = new ErrorEvent('error', { message: 'ignored error' });
    window.dispatchEvent(errorEvent);

    expect(filter).toHaveBeenCalled();
    expect(context.emit).not.toHaveBeenCalled();
    plugin.uninstall?.();
  });
});
