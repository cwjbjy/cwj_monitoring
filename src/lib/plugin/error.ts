import { track } from '../index';
import DefinePlugin from './definePlugin';
import { EMIT_RTYPE } from '../../types/event';

class ErrorPlugin extends DefinePlugin {
  constructor() {
    super('error');
  }

  monitor(): void {
    window.addEventListener('error', syncError); //同步错误（js错误，资源加载错误）
    window.addEventListener('unhandledrejection', asyncError); //异步错误（promise错误）
  }
}

function syncError(e: ErrorEvent) {
  const { error, target } = e;
  if (error instanceof Error) {
    return track.emit(EMIT_RTYPE.ERROR_JS, {
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
    return track.emit(EMIT_RTYPE.ERROR_RESOURCE, {
      message: `Failed to get resource：${url}`,
      url,
    });
  }

  return track.emit(EMIT_RTYPE.ERROR_JS, {
    message: e.message,
    filename: e.filename,
  });
}

function asyncError(e: PromiseRejectionEvent) {
  if (e.reason instanceof Error) {
    //reject中通过new Error抛出的错误
    track.emit(EMIT_RTYPE.ERROR_PROMISE, {
      stack: e.reason.stack,
      message: e.reason.message,
    });
  } else {
    track.emit(EMIT_RTYPE.ERROR_PROMISE, {
      message: e.reason,
    });
  }
}

export default new ErrorPlugin();
