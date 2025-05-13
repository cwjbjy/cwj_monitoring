import Core from '../core';
import DefinePlugin from './definePlugin';
import { EMIT_TYPE } from '../types/event';
import { TYPES } from '../types/event';
import { getSeconds } from '../utils';
class PVPlugin extends DefinePlugin {
  private pageStartTime: number = 0;
  private lastRouteTime: number = 0;

  constructor() {
    super(TYPES.ROUTER);
  }
  install(track: Core): void {
    this.track = track;
    this.pageStartTime = Date.now();
    this.lastRouteTime = this.pageStartTime;
    this.setupHashListener(); //监听hash路由
    this.setupHistoryListener(); //监听history路由
  }

  private emitRouteChange(type: string) {
    const now = Date.now();

    this.track?.emit(EMIT_TYPE.ROUTE_CHANGE, {
      from: document.referrer,
      to: window.location.href,
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

  /* 代理模式 */
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
    window.addEventListener('popstate', () => {
      this.emitRouteChange('popstate');
    });
  }
}

export default new PVPlugin();
