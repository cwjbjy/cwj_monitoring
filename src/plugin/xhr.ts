import { IPlugin, PluginContext } from './definePlugin';
import { TYPES, EMIT_TYPE } from '../types/event';

// 扩展 XMLHttpRequest 接口以包含自定义属性
interface CustomXMLHttpRequest extends XMLHttpRequest {
  _xhr_info?: {
    method: string;
    url: string;
    startTime: number;
  };
}

type OpenArgs = Parameters<typeof window.XMLHttpRequest.prototype.open>;
type SendArgs = Parameters<typeof window.XMLHttpRequest.prototype.send>;

export interface XHROptions {
  /** 过滤函数，返回 false 则不记录该请求 */
  filter?: (method: string, url: string) => boolean;
}

/**
 * XHR 监控插件
 * 监控 XMLHttpRequest 请求，记录失败的请求（状态码非 2xx）
 */
export const XHRPlugin = (options: XHROptions = {}): IPlugin => {
  let context: PluginContext;
  let originOpen: typeof XMLHttpRequest.prototype.open;
  let originSend: typeof XMLHttpRequest.prototype.send;

  const setupXHRListeners = () => {
    const originXhr = window.XMLHttpRequest;
    if (!originXhr) return;

    originOpen = originXhr.prototype.open;
    originSend = originXhr.prototype.send;

    // 重写 open 方法
    originXhr.prototype.open = function <T extends OpenArgs>(this: CustomXMLHttpRequest, ...args: T) {
      this._xhr_info = {
        method: args[0].toUpperCase(),
        url: String(args[1]),
        startTime: 0,
      };
      return originOpen.apply(this, args);
    };

    // 重写 send 方法
    originXhr.prototype.send = function <T extends SendArgs>(this: CustomXMLHttpRequest, ...args: T) {
      if (this._xhr_info) {
        this._xhr_info.startTime = Date.now();
      }

      const onLoadend = () => {
        if (this._xhr_info) {
          // 防止死循环：忽略发送到监控后台的请求
          const trackerUrl = context?.url;
          const { url, method, startTime } = this._xhr_info;

          if (trackerUrl && url.includes(trackerUrl)) {
            return;
          }

          // 如果配置了过滤函数且返回 false，则不记录
          if (options.filter && !options.filter(method, url)) {
            return;
          }

          const duration = Date.now() - startTime;
          const status = this.status;

          // 监听HTTP层面 状态码不是200~299的错误
          if (!(status >= 200 && status < 300)) {
            const data = {
              method,
              url,
              status,
              duration,
              // 限制响应体大小，避免数据过大
              response: this.response ? String(this.response).slice(0, 200) : '',
            };

            context?.emit(EMIT_TYPE.XHR, data);
          }
        }
      };

      this.addEventListener('loadend', onLoadend);
      return originSend.apply(this, args);
    };
  };

  const restoreXHR = () => {
    const originXhr = window.XMLHttpRequest;
    if (!originXhr) return;
    if (originOpen) originXhr.prototype.open = originOpen;
    if (originSend) originXhr.prototype.send = originSend;
  };

  return {
    name: TYPES.XHR,
    install: (ctx: PluginContext) => {
      context = ctx;
      setupXHRListeners();
    },
    uninstall: () => {
      restoreXHR();
    },
  };
};
