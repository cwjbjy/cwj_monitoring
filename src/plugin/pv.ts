import DefinePlugin, { PluginContext } from './definePlugin';
import { EMIT_TYPE } from '../types/event';
import { TYPES } from '../types/event';
import { getSeconds } from '../utils';

export interface PVOptions {
  /** 过滤函数，返回 false 则不记录该路由变化 */
  filter?: (to: string, from: string) => boolean;
}

export class PVPlugin extends DefinePlugin {
  private lastRouteTime: number = 0;
  private options: PVOptions;

  constructor(options: PVOptions = {}) {
    super(TYPES.ROUTER);
    this.options = options;
  }
  install(context: PluginContext): void {
    this.context = context;
    this.lastRouteTime = Date.now();
    this.setupHashListener(); //监听hash路由
    this.setupHistoryListener(); //监听history路由
    this.setupBrowserListene(); //监听浏览器前进与后退
  }

  private emitRouteChange(type: string) {
    const now = Date.now();
    const to = window.location.href;
    const from = document.referrer;

    // 如果配置了过滤函数且返回 false，则不记录
    if (this.options.filter && !this.options.filter(to, from)) {
      return;
    }

    this.context?.emit(EMIT_TYPE.ROUTE_CHANGE, {
      from,
      to,
      type,
      duration: getSeconds(now, this.lastRouteTime),
    });

    this.lastRouteTime = now;
  }

  private setupHashListener() {
    window.addEventListener('hashchange', () => {
      this.emitRouteChange('hashchange');
    });
  }

  private setupBrowserListene() {
    window.addEventListener('popstate', () => {
      this.emitRouteChange('popstate');
    });
  }

  private setupHistoryListener() {
    const historyPushState = window.history.pushState;
    const historyReplaceState = window.history.replaceState;
    window.history.pushState = (...args) => {
      historyPushState.apply(window.history, args);
      this.emitRouteChange('pushState');
    };
    window.history.replaceState = (...args) => {
      historyReplaceState.apply(window.history, args);
      this.emitRouteChange('replaceState');
    };
  }
}
