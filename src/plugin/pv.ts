import { IPlugin, PluginContext } from './definePlugin';
import { EMIT_TYPE, TYPES } from '../types/event';
import { getSeconds } from '../utils';

export interface PVOptions {
  /** 过滤函数，返回 false 则不记录该路由变化 */
  filter?: (to: string, from: string) => boolean;
}

export const PVPlugin = (options: PVOptions = {}): IPlugin => {
  let lastRouteTime: number = Date.now();
  let context: PluginContext;

  let originPushState: typeof window.history.pushState;
  let originReplaceState: typeof window.history.replaceState;

  const emitRouteChange = (type: string) => {
    const now = Date.now();
    const to = window.location.href;
    const from = document.referrer;

    // 如果配置了过滤函数且返回 false，则不记录
    if (options.filter && !options.filter(to, from)) {
      return;
    }

    context?.emit(EMIT_TYPE.ROUTE_CHANGE, {
      from,
      to,
      type,
      duration: getSeconds(now, lastRouteTime),
    });

    lastRouteTime = now;
  };

  const handleHashChange = () => emitRouteChange('hashchange');
  const handlePopState = () => emitRouteChange('popstate');

  const setupHistoryListener = () => {
    originPushState = window.history.pushState;
    originReplaceState = window.history.replaceState;

    window.history.pushState = (...args) => {
      originPushState.apply(window.history, args);
      emitRouteChange('pushState');
    };

    window.history.replaceState = (...args) => {
      originReplaceState.apply(window.history, args);
      emitRouteChange('replaceState');
    };
  };

  const restoreHistoryListener = () => {
    if (originPushState) window.history.pushState = originPushState;
    if (originReplaceState) window.history.replaceState = originReplaceState;
  };

  return {
    name: TYPES.ROUTER,
    install: (ctx: PluginContext) => {
      context = ctx;
      lastRouteTime = Date.now();
      window.addEventListener('hashchange', handleHashChange);
      window.addEventListener('popstate', handlePopState);
      setupHistoryListener();
    },
    uninstall: () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
      restoreHistoryListener();
    },
  };
};
