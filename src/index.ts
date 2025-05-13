import Tracker from './core/tracker';
import type { Options } from './types/index';
import ErrorPlugin from './plugin/error';
import PVPlugin from './plugin/pv';
import BehaviorPlugin from './plugin/behavior';
import PerformancePlugin from './plugin/performance';
import { TYPES } from './types/event';

// 注册核心插件
Tracker.registerPlugin(BehaviorPlugin);
Tracker.registerPlugin(ErrorPlugin);
Tracker.registerPlugin(PerformancePlugin);
Tracker.registerPlugin(PVPlugin);

/* 单例模式 */
const init = (function () {
  let connect = false;
  return function (options: Options) {
    if (!connect) {
      Tracker.start(options);
      connect = true;
    }
  };
})();

export { init, TYPES };

export default { init };
