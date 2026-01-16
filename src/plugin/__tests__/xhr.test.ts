import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XHRPlugin } from '../xhr';
import { EMIT_TYPE } from '../../types/event';

describe('XHRPlugin', () => {
  let context: any;

  beforeEach(() => {
    context = {
      emit: vi.fn(),
      url: 'http://localhost:3000/report',
    };

    // Mock XMLHttpRequest as a class
    class MockXHR {
      readyState = 0;
      status = 0;
      responseURL = '';
      response = '';
      _listeners: Record<string, any[]> = {};
      _monitor_xhr: any = null;

      open(method: string, url: string) {
        this._monitor_xhr = { method, url, startTime: Date.now() };
      }
      send() {}
      setRequestHeader() {}

      addEventListener(event: string, handler: any) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(handler);
      }

      dispatchEvent(event: any) {
        const type = typeof event === 'string' ? event : event.type;
        this._listeners[type]?.forEach((h: any) => h.call(this, { target: this }));
        return true;
      }
    }

    vi.stubGlobal('XMLHttpRequest', MockXHR);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should intercept failed XHR requests', () => {
    const plugin = XHRPlugin();
    plugin.install(context);

    const xhr = new XMLHttpRequest() as any;
    xhr.open('GET', 'http://api.example.com/data');
    xhr.send();

    // Simulate request completion with error status
    xhr.readyState = 4;
    xhr.status = 500;
    xhr.responseURL = 'http://api.example.com/data';
    xhr.response = 'Internal Server Error';

    // Trigger loadend
    xhr.dispatchEvent('loadend');

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.XHR,
      expect.objectContaining({
        url: 'http://api.example.com/data',
        method: 'GET',
        status: 500,
        response: 'Internal Server Error',
      }),
    );
    plugin.uninstall?.();
  });

  it('should ignore report URL', () => {
    const plugin = XHRPlugin();
    plugin.install(context);

    const xhr = new XMLHttpRequest() as any;
    xhr.open('POST', context.url);
    xhr.send();

    xhr.readyState = 4;
    xhr.status = 500; // Even with error status, it should be ignored if it's the report URL
    xhr.dispatchEvent('loadend');

    expect(context.emit).not.toHaveBeenCalled();
    plugin.uninstall?.();
  });
});
