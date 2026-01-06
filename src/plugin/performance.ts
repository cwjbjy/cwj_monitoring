import { IPlugin, PluginContext } from './definePlugin';
import { EMIT_TYPE, TYPES } from '../types/event';

export interface PerformanceOptions {
  /** 过滤函数，返回 false 则不记录该性能指标 */
  filter?: (type: EMIT_TYPE, value: any) => boolean;
}

export const PerformancePlugin = (options: PerformanceOptions = {}): IPlugin => {
  let context: PluginContext;
  let paintObserver: PerformanceObserver | null = null;
  let lcpObserver: PerformanceObserver | null = null;

  const monitorPaintMetrics = () => {
    const entryHandler = (list: { getEntries: () => any }) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-paint') {
          if (options.filter && !options.filter(EMIT_TYPE.PERFORMANCE_FP, entry.startTime)) {
            continue;
          }
          context?.emit(EMIT_TYPE.PERFORMANCE_FP, entry.startTime);
        } else if (entry.name === 'first-contentful-paint') {
          if (options.filter && !options.filter(EMIT_TYPE.PERFORMANCE_FCP, entry.startTime)) {
            continue;
          }
          context?.emit(EMIT_TYPE.PERFORMANCE_FCP, entry.startTime);
        }
      }
      paintObserver?.disconnect();
    };

    paintObserver = new PerformanceObserver(entryHandler);
    paintObserver.observe({ type: 'paint', buffered: true });
  };

  const monitorLCP = () => {
    const entryHandler = (list: { getEntries: () => any }) => {
      if (lcpObserver) {
        lcpObserver.disconnect();
      }

      for (const entry of list.getEntries()) {
        if (options.filter && !options.filter(EMIT_TYPE.PERFORMANCE_LCP, entry.startTime)) {
          continue;
        }
        context?.emit(EMIT_TYPE.PERFORMANCE_LCP, entry.startTime);
      }
    };

    lcpObserver = new PerformanceObserver(entryHandler);
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  };

  const handleDCL = (e: Event) => {
    if (options.filter && !options.filter(EMIT_TYPE.PERFORMANCE_DOMCONTENTLOADED, e.timeStamp)) {
      return;
    }
    context?.emit(EMIT_TYPE.PERFORMANCE_DOMCONTENTLOADED, e.timeStamp);
  };

  const handleLoad = (e: Event) => {
    if (options.filter && !options.filter(EMIT_TYPE.PERFORMANCE_LOAD, e.timeStamp)) {
      return;
    }
    context?.emit(EMIT_TYPE.PERFORMANCE_LOAD, e.timeStamp);
  };

  return {
    name: TYPES.PERFORMANCE,
    install: (ctx: PluginContext) => {
      context = ctx;
      monitorPaintMetrics();
      monitorLCP();
      window.addEventListener('DOMContentLoaded', handleDCL);
      window.addEventListener('load', handleLoad);
    },
    uninstall: () => {
      paintObserver?.disconnect();
      lcpObserver?.disconnect();
      window.removeEventListener('DOMContentLoaded', handleDCL);
      window.removeEventListener('load', handleLoad);
    },
  };
};
