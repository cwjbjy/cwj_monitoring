import Tracker from './core/tracker';
import type { Options } from './types/index';

// 导出核心功能
export { TYPES } from './types/event';
export type { Options } from './types/index';

// 导出插件供按需引入
export { default as ErrorPlugin } from './plugin/error';
export { default as PVPlugin } from './plugin/pv';
export { default as BehaviorPlugin } from './plugin/behavior';
export { default as PerformancePlugin } from './plugin/performance';

/**
 * 初始化监控 SDK
 */
export const init = (function () {
  let isInitialized = false;
  return function (options: Options) {
    if (!isInitialized) {
      Tracker.start(options);
      isInitialized = true;
    }
  };
})();

export default { init };
