import DefinePlugin, { PluginContext } from './definePlugin';
import { TYPES, EMIT_TYPE } from '../types/event';

export interface FetchOptions {
  /** 过滤函数，返回 false 则不记录该请求 */
  filter?: (method: string, url: string) => boolean;
}

export class FetchPlugin extends DefinePlugin {
  private options: FetchOptions;

  constructor(options: FetchOptions = {}) {
    super(TYPES.FETCH);
    this.options = options;
  }

  install(context: PluginContext): void {
    this.context = context;
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
          const trackerUrl = self.context?.url;
          if (trackerUrl && url.includes(trackerUrl)) {
            return response;
          }

          // 如果配置了过滤函数且返回 false，则不记录
          if (self.options.filter && !self.options.filter(method, url)) {
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
            self.context?.emit(EMIT_TYPE.FETCH, data);
          }
          return response;
        },
        (error) => {
          const trackerUrl = self.context?.url;
          if (trackerUrl && url.includes(trackerUrl)) {
            throw error;
          }

          // 如果配置了过滤函数且返回 false，则不记录
          if (self.options.filter && !self.options.filter(method, url)) {
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
          self.context?.emit(EMIT_TYPE.FETCH, data);
          throw error;
        },
      );
    };
  }
}
