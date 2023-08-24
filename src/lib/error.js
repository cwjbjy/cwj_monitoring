import { emit } from "./index";

export default function Error() {
  JSError(); //js错误
  resourceError(); //资源加载错误
  consoleError(); //手动抛出错误
  promiseError(); //promise错误
}

/**
 * @param {String}  msg    错误信息
 * @param {String}  url    出错文件
 * @param {Number}  line    行号
 * @param {Number}  column    列号
 * @param {Object}  error  Error对象
 */
function JSError() {
  window.onerror = (msg, url, line, column, error) => {
    emit("js_error", { msg, url, line, column, error });
  };
}

function resourceError() {
  window.addEventListener(
    "error",
    function (e) {
      const target = e.target;
      if (!target) return;
      if (target.src || target.href) {
        const url = target.src || target.href;
        emit("resource_error", url);
      }
    },
    true
  );
}

function consoleError() {
  var oldError = window.console.error;
  window.console.error = function (errorMsg) {
    emit("console_error", errorMsg);
    oldError.apply(window.console, arguments);
  };
}

function promiseError() {
  window.addEventListener("unhandledrejection", function (e) {
    emit("promise_error", e.error.stack);
  });
}
