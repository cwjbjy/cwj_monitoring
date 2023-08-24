import initBase, { emit } from "./lib";

const init = (function () {
  let connect = null;
  return function (options) {
    if (!connect) {
      initBase(options);
      connect = true;
    }
  };
})();

export { init, emit };

export default { init, emit };
