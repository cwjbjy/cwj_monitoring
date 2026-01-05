import Core from '../core';
import DefinePlugin from './definePlugin';
import { EMIT_TYPE, TYPES } from '../types/event';

/**
 * 错误监控插件
 * 监控并捕获 JavaScript 错误、资源加载错误、Promise 拒绝以及 console.error 调用
 */
class ErrorPlugin extends DefinePlugin {
  private originalConsoleError?: (...data: any[]) => void;

  constructor() {
    super(TYPES.ERROR);
  }

  /**
   * 安装错误监控插件
   */
  install(tracker: Core): void {
    this.tracker = tracker;

    // 如果启用，重写 console.error
    this.overrideConsoleError();

    // 设置错误监听器
    this.setupErrorListeners();
  }

  /**
   * 重写 console.error 以捕获错误日志
   */
  private overrideConsoleError(): void {
    this.originalConsoleError = console.error;

    console.error = (...args: any[]) => {
      // 调用原始的 console.error
      this.originalConsoleError?.apply(console, args);

      // 捕获错误信息
      const errorData = {
        type: 'console',
        message: args.map((arg) => String(arg)).join(' '),
        stack: new Error().stack,
      };

      this.tracker?.emit(EMIT_TYPE.ERROR, errorData);
    };
  }

  /**
   * 设置全局错误监听器
   */
  private setupErrorListeners(): void {
    // 同步错误（JS 错误、资源加载错误）
    const errorHandler = (e: ErrorEvent) => {
      this.handleSyncError(e);
    };
    window.addEventListener('error', errorHandler, true);

    // 异步错误（Promise 拒绝）
    const rejectionHandler = (e: PromiseRejectionEvent) => {
      this.handleAsyncError(e);
    };
    window.addEventListener('unhandledrejection', rejectionHandler, true);
  }

  /**
   * 处理同步错误
   */
  private handleSyncError(e: ErrorEvent): void {
    const errorData = {
      type: 'sync',
      ...this.getErrorDetails(e),
    };

    this.tracker?.emit(EMIT_TYPE.ERROR, errorData);
  }

  /**
   * 处理异步错误（Promise 拒绝）
   */
  private handleAsyncError(e: PromiseRejectionEvent): void {
    const errorData = {
      type: 'async',
      ...this.getPromiseErrorDetails(e),
    };

    this.tracker?.emit(EMIT_TYPE.ERROR, errorData);
  }

  /**
   * 从 Promise 拒绝中提取错误详情
   */
  private getPromiseErrorDetails(e: PromiseRejectionEvent) {
    // reject 中通过 throw 抛出的错误
    if (e.reason instanceof Error) {
      return {
        errorType: 'promise',
        message: e.reason.message,
        stack: this.cleanStack(e.reason.stack),
        name: e.reason.name,
        fingerprint: this.generateFingerprint(e.reason.message, e.reason.stack),
      };
    }

    // 使用字符串或其他值拒绝
    return {
      errorType: 'promise',
      message: String(e.reason),
    };
  }

  /**
   * 从 ErrorEvent 中提取错误详情
   */
  private getErrorDetails(e: ErrorEvent) {
    const { error, target, filename, message } = e;

    // JavaScript 错误
    if (error instanceof Error) {
      return {
        errorType: 'js',
        name: error.name,
        message: error.message,
        stack: this.cleanStack(error.stack),
        filename,
        colno: e.colno,
        lineno: e.lineno,
        fingerprint: this.generateFingerprint(error.message, error.stack),
      };
    }

    // 资源加载错误
    if (this.isResourceError(target)) {
      const element = target as HTMLImageElement | HTMLScriptElement | HTMLLinkElement;
      const url = 'src' in element ? element.src : element.href;

      return {
        errorType: 'resource',
        message: `Resource load failed: ${url}`,
        url,
        tagName: element.tagName,
        fingerprint: this.generateFingerprint(`resource:${url}`),
      };
    }

    // 未知错误类型
    return {
      errorType: 'unknown',
      message,
      filename,
    };
  }

  /**
   * 检查错误是否为资源加载错误
   */
  private isResourceError(target: any): boolean {
    const resourceTags = ['LINK', 'SCRIPT', 'IMG', 'AUDIO', 'VIDEO', 'IFRAME'];
    return target && resourceTags.includes(target.tagName);
  }

  /**
   * 清理并限制堆栈追踪深度
   */
  private cleanStack(stack?: string): string | undefined {
    if (!stack) return undefined;

    const lines = stack.split('\n').slice(0, 11);
    return lines.join('\n');
  }

  /**
   * 生成错误指纹以对相似错误进行分组
   */
  private generateFingerprint(...parts: (string | undefined)[]): string {
    const combined = parts.filter(Boolean).join('|');
    return this.simpleHash(combined);
  }

  /**
   * 用于生成指纹的简单哈希函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为 32 位整数
    }
    return Math.abs(hash).toString(36);
  }
}

export default new ErrorPlugin();
