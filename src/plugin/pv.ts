import Core from '../core';
import DefinePlugin from './definePlugin';
import { EMIT_TYPE } from '../types/event';
import { TYPES } from '../types/event';
class PVPlugin extends DefinePlugin {
  constructor() {
    super(TYPES.ROUTER);
  }
  monitor(track: Core): void {
    this.track = track;
    this.setupHashListener(); //监听hash路由
    this.setupHistoryListener(); //监听history路由
  }

  private setupHashListener() {
    window.addEventListener('hashchange', () => {
      this.track?.emit(EMIT_TYPE.ROUTER_HASH);
    });
  }

  /* 代理模式 */
  private setupHistoryListener() {
    const historyPushState = window.history.pushState;
    const historyReplaceState = window.history.replaceState;
    window.history.pushState = (...args) => {
      historyPushState.apply(window.history, args);
      this.track?.emit(EMIT_TYPE.ROUTER_HISTORY);
    };
    window.history.replaceState = (...args) => {
      //@ts-ignore
      // eslint-disable-next-line prefer-rest-params
      historyReplaceState.apply(window.history, args);
      this.track?.emit(EMIT_TYPE.ROUTER_HISTORY);
    };
    window.addEventListener('popstate', () => {
      this.track?.emit(EMIT_TYPE.ROUTER_HISTORY);
    });
  }
}

export default new PVPlugin();
