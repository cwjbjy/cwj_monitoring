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
    emit("error_js", { msg, url, line, column, error });
  };
}

function resourceError() {
  window.addEventListener(
    "error",
    function (e) {
      const target: any = e.target;
      if (!target) return;
      if (target.src || target.href) {
        const url = target.src || target.href;
        emit("error_resource", url);
      }
    },
    true
  );
}

function consoleError() {
  var oldError = window.console.error;
  window.console.error = function (errorMsg) {
    emit("error_console", errorMsg);
    //@ts-ignore
    oldError.apply(window.console, arguments);
  };
}

function promiseError() {
  window.addEventListener(
    "unhandledrejection",
    function (e: PromiseRejectionEvent) {
      //@ts-ignore
      emit("error_promise", e.error.stack);
    }
  );
}
