import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Reporter from '../reporter';

describe('Reporter', () => {
  const url = 'http://localhost:3000/report';
  let reporter: Reporter;
  let lastXHRInstance: any;

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock navigator.sendBeacon
    global.navigator.sendBeacon = vi.fn().mockReturnValue(true);

    class MockXHR {
      constructor() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        lastXHRInstance = this;
      }
      open = vi.fn();
      send = vi.fn();
      setRequestHeader = vi.fn();
      status = 200;
      onload = null as any;
      onerror = null as any;
    }
    // @ts-ignore
    global.XMLHttpRequest = MockXHR;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should batch events and send when maxBatchSize is reached', () => {
    reporter = new Reporter(url, { maxBatchSize: 2 });
    const payload = { type: 'test', data: {}, date: '', device: {} as any, uuid: '' };

    reporter.send(payload);
    expect(navigator.sendBeacon).not.toHaveBeenCalled();

    reporter.send(payload);
    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
  });

  it('should send events after maxWaitTime', () => {
    reporter = new Reporter(url, { maxBatchSize: 10, maxWaitTime: 1000 });
    const payload = { type: 'test', data: {}, date: '', device: {} as any, uuid: '' };

    reporter.send(payload);
    expect(navigator.sendBeacon).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
  });

  it('should flush events immediately', async () => {
    reporter = new Reporter(url, { maxBatchSize: 10 });
    const payload = { type: 'test', data: {}, date: '', device: {} as any, uuid: '' };
    reporter.send(payload);

    await reporter.flush();
    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
  });

  it('should fallback to XHR if sendBeacon fails', () => {
    global.navigator.sendBeacon = vi.fn().mockReturnValue(false);

    reporter = new Reporter(url, { maxBatchSize: 1 });
    const payload = { type: 'test', data: {}, date: '', device: {} as any, uuid: '' };

    reporter.send(payload);
    expect(navigator.sendBeacon).toHaveBeenCalled();
    expect(lastXHRInstance).toBeDefined();
    expect(lastXHRInstance.send).toHaveBeenCalled();
  });

  it('should handle XHR success and failure', async () => {
    global.navigator.sendBeacon = undefined as any; // Force XHR

    reporter = new Reporter(url, { maxBatchSize: 1 });
    const payload = { type: 'test', data: {}, date: '', device: {} as any, uuid: '' };

    // Test Success
    reporter.send(payload);
    if (lastXHRInstance && lastXHRInstance.onload) lastXHRInstance.onload();

    // Test Failure
    reporter.send(payload); // Trigger next send
    if (lastXHRInstance) {
      lastXHRInstance.status = 500;
      if (lastXHRInstance.onload) lastXHRInstance.onload();
    }

    // Test Network Error
    reporter.send(payload);
    if (lastXHRInstance && lastXHRInstance.onerror) lastXHRInstance.onerror();

    expect(lastXHRInstance.send).toHaveBeenCalled();
  });
});
