import { track } from '../index';
import DefinePlugin from './definePlugin';

class ErrorPlugin extends DefinePlugin {
  constructor() {
    super('error');
  }

  monitor(): void {
    this.JSError(); //js错误
    this.resourceError(); //资源加载错误
    this.consoleError(); //手动抛出错误
    this.promiseError(); //promise错误
  }

  JSError() {
    window.onerror = (msg, url, line, column, error) => {
      track.emit('error_js', { msg, url, line, column, error });
    };
  }

  resourceError() {
    window.addEventListener(
      'error',
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
          const url = (target as HTMLImageElement | HTMLScriptElement).src || (target as HTMLLinkElement).href;
          track.emit('error_resource', url);
        }
      },
      true,
    );
  }

  consoleError() {
    const oldError = window.console.error;
    window.console.error = function (errorMsg, ...restArgs) {
      track.emit('error_console', errorMsg);
      oldError.apply(window.console, [errorMsg, ...restArgs]);
    };
  }

  promiseError() {
    window.addEventListener('unhandledrejection', function (e: PromiseRejectionEvent) {
      if (e.reason.stack) {
        //reject中通过new Error抛出的错误
        track.emit('error_promise', e.reason.message);
      } else {
        track.emit('error_promise', e.reason);
      }
    });
  }
}

export default new ErrorPlugin();
