import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BehaviorPlugin } from '../behavior';
import { EMIT_TYPE } from '../../types/event';

describe('BehaviorPlugin', () => {
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

  it('should capture click events', () => {
    const plugin = BehaviorPlugin();
    plugin.install(context);

    const button = document.createElement('button');
    button.id = 'test-btn';
    button.textContent = 'Click Me';
    document.body.appendChild(button);

    button.click();
    vi.advanceTimersByTime(500);

    expect(context.emit).toHaveBeenCalledWith(
      EMIT_TYPE.CLICK,
      expect.objectContaining({
        tagName: 'BUTTON',
        id: 'test-btn',
        text: 'Click Me',
        xPath: '//*[@id="test-btn"]',
      }),
    );

    document.body.removeChild(button);
    plugin.uninstall?.();
  });

  it('should throttle click events', () => {
    const plugin = BehaviorPlugin({ throttleDelay: 1000 });
    plugin.install(context);

    const button = document.createElement('button');
    document.body.appendChild(button);

    button.click();
    button.click();
    button.click();

    vi.advanceTimersByTime(1000);

    expect(context.emit).toHaveBeenCalledTimes(1);

    document.body.removeChild(button);
    plugin.uninstall?.();
  });

  it('should respect filter option', () => {
    const filter = vi.fn().mockReturnValue(false);
    const plugin = BehaviorPlugin({ filter });
    plugin.install(context);

    const button = document.createElement('button');
    document.body.appendChild(button);

    button.click();
    vi.advanceTimersByTime(500);

    expect(filter).toHaveBeenCalled();
    expect(context.emit).not.toHaveBeenCalled();

    document.body.removeChild(button);
    plugin.uninstall?.();
  });
});
