import { track } from '../index';
import DefinePlugin from './definePlugin';
import { EMIT_RTYPE } from '../../types/event';

class PVPlugin extends DefinePlugin {
  constructor() {
    super('pv');
  }
  monitor(): void {
    this.Hash(); //监听hash路由
    this.History(); //监听history路由
  }

  Hash() {
    window.addEventListener('hashchange', function () {
      track.emit(EMIT_RTYPE.ROUTER_HASH);
    });
  }

  /* 代理模式 */
  History() {
    const historyPushState = window.history.pushState;
    const historyReplaceState = window.history.replaceState;
    window.history.pushState = function () {
      //@ts-ignore
      // eslint-disable-next-line prefer-rest-params
      historyPushState.apply(window.history, arguments);
      track.emit(EMIT_RTYPE.ROUTER_HISTORY);
    };
    window.history.replaceState = function () {
      //@ts-ignore
      // eslint-disable-next-line prefer-rest-params
      historyReplaceState.apply(window.history, arguments);
      track.emit(EMIT_RTYPE.ROUTER_HISTORY);
    };
    window.addEventListener('popstate', function () {
      track.emit(EMIT_RTYPE.ROUTER_HISTORY);
    });
  }
}

export default new PVPlugin();
