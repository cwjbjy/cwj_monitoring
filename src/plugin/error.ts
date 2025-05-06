import Core from '../core';
import DefinePlugin from './definePlugin';
import { EMIT_TYPE } from '../types/event';
import { TYPES } from '../types/event';
class ErrorPlugin extends DefinePlugin {
  constructor() {
    super(TYPES.ERROR);
  }

  monitor(track: Core): void {
    window.addEventListener('error', (e) => {
      this.syncError(e, track);
    }); //同步错误（js错误，资源加载错误）
    window.addEventListener('unhandledrejection', (e) => {
      this.asyncError(e, track);
    }); //异步错误（promise错误）
  }

  private syncError(e: ErrorEvent, track: Core) {
    const { error, target } = e;
    if (error instanceof Error) {
      return track.emit(EMIT_TYPE.ERROR_JS, {
        message: error.message,
        stack: error.stack,
        filename: e.filename,
      });
    }

    if (
      target instanceof HTMLLinkElement ||
      target instanceof HTMLScriptElement ||
      target instanceof HTMLImageElement ||
      target instanceof HTMLAudioElement ||
      target instanceof HTMLVideoElement ||
      target instanceof HTMLIFrameElement
    ) {
      const url = (target as HTMLImageElement | HTMLScriptElement).src || (target as HTMLLinkElement).href;
      return track.emit(EMIT_TYPE.ERROR_RESOURCE, {
        message: `Failed to get resource：${url}`,
        url,
      });
    }

    return track.emit(EMIT_TYPE.ERROR_JS, {
      message: e.message,
      filename: e.filename,
    });
  }

  private asyncError(e: PromiseRejectionEvent, track: Core) {
    if (e.reason instanceof Error) {
      //reject中通过new Error抛出的错误
      track.emit(EMIT_TYPE.ERROR_PROMISE, {
        stack: e.reason.stack,
        message: e.reason.message,
      });
    } else {
      track.emit(EMIT_TYPE.ERROR_PROMISE, {
        message: e.reason,
      });
    }
  }
}

export default new ErrorPlugin();
