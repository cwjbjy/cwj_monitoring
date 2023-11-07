import initBase from './lib';
import type { Options } from './types/index';

/* 单例模式 */
const init = (function () {
  let connect = false;
  return function (options: Options) {
    if (!connect) {
      initBase(options);
      connect = true;
    }
  };
})();

export { init };

export { TYPES } from './types/event';

export default { init };
