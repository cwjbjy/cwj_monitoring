import Core from '../core';
import DefinePlugin from './definePlugin';
import { EMIT_TYPE } from '../types/event';
import { TYPES } from '../types/event';
class ErrorPlugin extends DefinePlugin {
  private originalConsoleError?: (...data: any[]) => void;

  constructor() {
    super(TYPES.ERROR);
  }

  install(track: Core): void {
    this.track = track;
    // 重写console.error
    this.overrideConsoleError();
    // 监听错误事件
    this.setupErrorListeners();
  }

  private overrideConsoleError() {
    this.originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // 调用原始console.error
      this.originalConsoleError?.apply(console, args);

      // 捕获错误信息并上报
      const errorData = {
        type: 'console',
        message: args.map((arg) => String(arg)).join(' '),
        stack: new Error().stack,
      };
      this.track?.emit(EMIT_TYPE.ERROR, errorData);
    };
  }

  private setupErrorListeners() {
    //同步错误（js错误，资源加载错误）
    window.addEventListener(
      'error',
      (e: ErrorEvent) => {
        this.handleSyncError(e, this.track);
      },
      true,
    );
    //异步错误（promise错误）
    window.addEventListener(
      'unhandledrejection',
      (e: PromiseRejectionEvent) => {
        this.handleAsyncError(e, this.track);
      },
      true,
    );
  }

  private handleSyncError(e: ErrorEvent, track?: Core) {
    const errorData = {
      type: 'sync',
      ...this.getErrorDetails(e),
    };
    track?.emit(EMIT_TYPE.ERROR, errorData);
  }

  private handleAsyncError(e: PromiseRejectionEvent, track?: Core) {
    const errorData = {
      type: 'async',
      ...this.getPromiseErrorDetails(e),
    };
    track?.emit(EMIT_TYPE.ERROR, errorData);
  }

  private getPromiseErrorDetails(e: PromiseRejectionEvent) {
    //reject中通过throw抛出的错误
    if (e.reason instanceof Error) {
      return {
        errorType: 'promise',
        message: e.reason.message,
        stack: e.reason.stack,
      };
    }
    return {
      errorType: 'promise',
      message: String(e.reason),
    };
  }

  private getErrorDetails(e: ErrorEvent) {
    const { error, target, filename, message } = e;

    // 处理js错误
    if (error instanceof Error) {
      return {
        errorType: 'js',
        message: error.message,
        stack: error.stack,
        filename,
        colno: e.colno,
        lineno: e.lineno,
      };
    }

    // 处理资源加载错误
    if (this.isResourceError(target)) {
      const url = (target as HTMLImageElement | HTMLScriptElement).src || (target as HTMLLinkElement).href;
      return {
        errorType: 'resource',
        message: `Resource load failed: ${url}`,
        url,
      };
    }

    return {
      errorType: 'unknown',
      message,
      filename,
    };
  }

  private isResourceError(target: any): boolean {
    const resourceTags = ['LINK', 'SCRIPT', 'IMG', 'AUDIO', 'VIDEO', 'IFRAME'];
    return target && resourceTags.includes(target.tagName);
  }
}

export default new ErrorPlugin();
