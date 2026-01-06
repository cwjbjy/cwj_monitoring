import DefinePlugin from './definePlugin';
import { TYPES, EMIT_TYPE } from '../types/event';
import Core from '../core';

class FetchPlugin extends DefinePlugin {
  constructor() {
    super(TYPES.FETCH);
  }

  install(track: Core): void {
    this.tracker = track;
    this.setupFetchListeners();
  }

  setupFetchListeners(): void {
    const originFetch = window.fetch;
    if (!originFetch) return;

    const self = this;
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const startTime = Date.now();
      const method = (init?.method || 'GET').toUpperCase();
      const url = input instanceof Request ? input.url : String(input);

      return originFetch.apply(this, [input, init]).then(
        (response) => {
          const trackerUrl = self.tracker?.url;
          if (trackerUrl && url.includes(trackerUrl)) {
            return response;
          }

          if (!response.ok) {
            const duration = Date.now() - startTime;
            const data = {
              method,
              url,
              status: response.status,
              duration,
              success: false,
            };
            self.tracker?.emit(EMIT_TYPE.FETCH, data);
          }
          return response;
        },
        (error) => {
          const trackerUrl = self.tracker?.url;
          if (trackerUrl && url.includes(trackerUrl)) {
            throw error;
          }

          const duration = Date.now() - startTime;
          const data = {
            method,
            url,
            status: 0,
            duration,
            success: false,
            message: error.message,
          };
          self.tracker?.emit(EMIT_TYPE.FETCH, data);
          throw error;
        },
      );
    };
  }
}

export default new FetchPlugin();
