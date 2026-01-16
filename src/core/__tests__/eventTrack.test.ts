import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventTrack from '../eventTrack';
import Reporter from '../reporter';
import { EMIT_TYPE } from '../../types/event';

describe('EventTrack', () => {
  let reporter: Reporter;
  let eventTrack: EventTrack;
  const options = {
    url: 'http://localhost:3000/report',
    uuidKey: 'test_uuid',
    data: { app: 'test-app' },
  };

  beforeEach(() => {
    reporter = new Reporter(options.url);
    vi.spyOn(reporter, 'send').mockImplementation(() => {});
    eventTrack = new EventTrack(options, reporter);
  });

  it('should format and send payload correctly', () => {
    const data = { foo: 'bar' };
    eventTrack.emit(EMIT_TYPE.CLICK, data);

    expect(reporter.send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: EMIT_TYPE.CLICK,
        data: data,
        userData: options.data,
        device: expect.any(Object),
        uuid: expect.any(String),
        date: expect.any(String),
      }),
    );
  });
});
