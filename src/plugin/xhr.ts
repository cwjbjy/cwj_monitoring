import DefinePlugin, { PluginContext } from './definePlugin';
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

export class XHRPlugin extends DefinePlugin {
  private options: XHROptions;

  constructor(options: XHROptions = {}) {
    super(TYPES.XHR);
    this.options = options;
  }

  install(context: PluginContext): void {
    this.context = context;
    this.setupXHRListeners();
  }

  setupXHRListeners(): void {
    const originXhr = window.XMLHttpRequest;
    if (!originXhr) return;

    const originOpen = originXhr.prototype.open;
    const originSend = originXhr.prototype.send;
    const self = this;

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
          const trackerUrl = self.context?.url;
          const { url, method, startTime } = this._xhr_info;

          if (trackerUrl && url.includes(trackerUrl)) {
            return;
          }

          // 如果配置了过滤函数且返回 false，则不记录
          if (self.options.filter && !self.options.filter(method, url)) {
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

            self.context?.emit(EMIT_TYPE.XHR, data);
          }
        }
      };

      this.addEventListener('loadend', onLoadend);
      return originSend.apply(this, args);
    };
  }
}
