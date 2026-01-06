import { IPlugin, PluginContext } from './definePlugin';
import { EMIT_TYPE, TYPES } from '../types/event';

export interface ErrorOptions {
  /** 过滤函数，返回 false 则不记录该错误 */
  filter?: (error: any) => boolean;
}

/**
 * 错误监控插件
 * 监控并捕获 JavaScript 错误、资源加载错误、Promise 拒绝以及 console.error 调用
 */
export const ErrorPlugin = (options: ErrorOptions = {}): IPlugin => {
  let originalConsoleError: (...data: any[]) => void;
  let context: PluginContext;

  /**
   * 重写 console.error 以捕获错误日志
   */
  const overrideConsoleError = () => {
    originalConsoleError = console.error;

    console.error = (...args: any[]) => {
      // 调用原始的 console.error
      originalConsoleError?.apply(console, args);

      // 捕获错误信息
      const errorData = {
        type: 'console',
        message: args.map((arg) => String(arg)).join(' '),
        stack: new Error().stack,
      };

      // 如果配置了过滤函数且返回 false，则不记录
      if (options.filter && !options.filter(errorData)) {
        return;
      }

      context?.emit(EMIT_TYPE.ERROR, errorData);
    };
  };

  /**
   * 恢复 console.error
   */
  const restoreConsoleError = () => {
    if (originalConsoleError) {
      console.error = originalConsoleError;
    }
  };

  /**
   * 清理并限制堆栈追踪深度
   */
  const cleanStack = (stack?: string): string | undefined => {
    if (!stack) return undefined;
    const lines = stack.split('\n').slice(0, 11);
    return lines.join('\n');
  };

  /**
   * 用于生成指纹的简单哈希函数
   */
  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为 32 位整数
    }
    return Math.abs(hash).toString(36);
  };

  /**
   * 生成错误指纹以对相似错误进行分组
   */
  const generateFingerprint = (...parts: (string | undefined)[]): string => {
    const combined = parts.filter(Boolean).join('|');
    return simpleHash(combined);
  };

  /**
   * 检查错误是否为资源加载错误
   */
  const isResourceError = (target: any): boolean => {
    const resourceTags = ['LINK', 'SCRIPT', 'IMG', 'AUDIO', 'VIDEO', 'IFRAME'];
    return target && resourceTags.includes(target.tagName);
  };

  /**
   * 从 Promise 拒绝中提取错误详情
   */
  const getPromiseErrorDetails = (e: PromiseRejectionEvent) => {
    if (e.reason instanceof Error) {
      return {
        errorType: 'promise',
        message: e.reason.message,
        stack: cleanStack(e.reason.stack),
        name: e.reason.name,
        fingerprint: generateFingerprint(e.reason.message, e.reason.stack),
      };
    }
    return {
      errorType: 'promise',
      message: String(e.reason),
    };
  };

  /**
   * 从 ErrorEvent 中提取错误详情
   */
  const getErrorDetails = (e: ErrorEvent) => {
    const { error, target, filename, message } = e;
    if (error instanceof Error) {
      return {
        errorType: 'js',
        name: error.name,
        message: error.message,
        stack: cleanStack(error.stack),
        filename,
        colno: e.colno,
        lineno: e.lineno,
        fingerprint: generateFingerprint(error.message, error.stack),
      };
    }
    if (isResourceError(target)) {
      const element = target as HTMLImageElement | HTMLScriptElement | HTMLLinkElement;
      const url = 'src' in element ? element.src : element.href;
      return {
        errorType: 'resource',
        message: `Resource load failed: ${url}`,
        url,
        tagName: element.tagName,
        fingerprint: generateFingerprint(`resource:${url}`),
      };
    }
    return {
      errorType: 'unknown',
      message,
      filename,
    };
  };

  const errorHandler = (e: ErrorEvent) => {
    const errorData = { type: 'sync', ...getErrorDetails(e) };
    if (options.filter && !options.filter(errorData)) return;
    context?.emit(EMIT_TYPE.ERROR, errorData);
  };

  const rejectionHandler = (e: PromiseRejectionEvent) => {
    const errorData = { type: 'async', ...getPromiseErrorDetails(e) };
    if (options.filter && !options.filter(errorData)) return;
    context?.emit(EMIT_TYPE.ERROR, errorData);
  };

  return {
    name: TYPES.ERROR,
    install: (ctx: PluginContext) => {
      context = ctx;
      overrideConsoleError();
      window.addEventListener('error', errorHandler, true);
      window.addEventListener('unhandledrejection', rejectionHandler, true);
    },
    uninstall: () => {
      restoreConsoleError();
      window.removeEventListener('error', errorHandler, true);
      window.removeEventListener('unhandledrejection', rejectionHandler, true);
    },
  };
};
