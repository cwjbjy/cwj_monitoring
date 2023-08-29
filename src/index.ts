import initBase from "./lib";
import type { Options } from "./types";

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

export default { init };
