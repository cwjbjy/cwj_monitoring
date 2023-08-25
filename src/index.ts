import initBase, { emit } from "./lib";
import { Options } from "./types";

const init = (function () {
  let connect = false;
  return function (options: Options) {
    if (!connect) {
      initBase(options);
      connect = true;
    }
  };
})();

export { init, emit };

export default { init, emit };
