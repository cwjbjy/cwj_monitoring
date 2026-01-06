import { IPlugin, PluginContext } from './definePlugin';
import { TYPES, EMIT_TYPE } from '../types/event';

export interface FetchOptions {
  /** 过滤函数，返回 false 则不记录该请求 */
  filter?: (method: string, url: string) => boolean;
}

/**
 * Fetch 监控插件
 * 监控 fetch 请求，记录失败的请求（状态码非 2xx 或网络错误）
 */
export const FetchPlugin = (options: FetchOptions = {}): IPlugin => {
  let context: PluginContext;
  let originFetch: typeof window.fetch;

  const setupFetchListeners = () => {
    originFetch = window.fetch;
    if (!originFetch) return;

    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      const startTime = Date.now();
      const method = (init?.method || 'GET').toUpperCase();
      const url = input instanceof Request ? input.url : String(input);

      return originFetch.apply(this, [input, init]).then(
        (response) => {
          const trackerUrl = context?.url;
          if (trackerUrl && url.includes(trackerUrl)) {
            return response;
          }

          // 如果配置了过滤函数且返回 false，则不记录
          if (options.filter && !options.filter(method, url)) {
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
            context?.emit(EMIT_TYPE.FETCH, data);
          }
          return response;
        },
        (error) => {
          const trackerUrl = context?.url;
          if (trackerUrl && url.includes(trackerUrl)) {
            throw error;
          }

          // 如果配置了过滤函数且返回 false，则不记录
          if (options.filter && !options.filter(method, url)) {
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
          context?.emit(EMIT_TYPE.FETCH, data);
          throw error;
        },
      );
    };
  };

  const restoreFetch = () => {
    if (originFetch) window.fetch = originFetch;
  };

  return {
    name: TYPES.FETCH,
    install: (ctx: PluginContext) => {
      context = ctx;
      setupFetchListeners();
    },
    uninstall: () => {
      restoreFetch();
    },
  };
};
