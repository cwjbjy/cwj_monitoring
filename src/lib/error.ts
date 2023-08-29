import { track } from "./index";

export default function Error() {
  JSError(); //js错误
  resourceError(); //资源加载错误
  consoleError(); //手动抛出错误
  promiseError(); //promise错误
}

function JSError() {
  window.onerror = (msg, url, line, column, error) => {
    track.emit("error_js", { msg, url, line, column, error });
  };
}

function resourceError() {
  window.addEventListener(
    "error",
    function (e) {
      const { target } = e;
      if (
        target instanceof HTMLLinkElement ||
        target instanceof HTMLScriptElement ||
        target instanceof HTMLImageElement ||
        target instanceof HTMLAudioElement ||
        target instanceof HTMLVideoElement ||
        target instanceof HTMLIFrameElement
      ) {
        //资源加载错误
        const url =
          (target as HTMLImageElement | HTMLScriptElement).src ||
          (target as HTMLLinkElement).href;
        track.emit("error_resource", url);
      }
    },
    true
  );
}

function consoleError() {
  var oldError = window.console.error;
  window.console.error = function (errorMsg) {
    track.emit("error_console", errorMsg);
    //@ts-ignore
    oldError.apply(window.console, arguments);
  };
}

function promiseError() {
  window.addEventListener(
    "unhandledrejection",
    function (e: PromiseRejectionEvent) {
      //@ts-ignore
      track.emit("error_promise", e.error.stack);
    }
  );
}
