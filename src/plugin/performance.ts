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
  let inpObserver: PerformanceObserver | null = null;
  let longTaskObserver: PerformanceObserver | null = null;
  // 存储交互事件的 Map: interactionId -> { entry, timeoutId }
  const interactionMap = new Map<number, { entry: any; timeoutId: any }>();

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

    try {
      paintObserver = new PerformanceObserver(entryHandler);
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.warn('[CWJ Monitor] Paint observation not supported:', e);
    }
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

    try {
      lcpObserver = new PerformanceObserver(entryHandler);
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('[CWJ Monitor] LCP observation not supported:', e);
    }
  };

  const monitorINP = () => {
    const entryHandler = (list: { getEntries: () => any }) => {
      for (const entry of list.getEntries()) {
        // 仅处理有 interactionId 的交互事件
        if (!entry.interactionId) continue;

        // 获取该 interactionId 已有的记录
        const existing = interactionMap.get(entry.interactionId);
        if (existing) {
          clearTimeout(existing.timeoutId);
        }

        // 取耗时最长的事件作为该次交互的代表
        const maxEntry = existing && existing.entry.duration > entry.duration ? existing.entry : entry;

        // 防抖：200ms 内无新事件则上报
        const timeoutId = setTimeout(() => {
          interactionMap.delete(maxEntry.interactionId);

          if (options.filter && !options.filter(EMIT_TYPE.PERFORMANCE_INP, maxEntry)) {
            return;
          }

          context?.emit(EMIT_TYPE.PERFORMANCE_INP, {
            value: maxEntry.duration,
            startTime: maxEntry.startTime,
            name: maxEntry.name,
            interactionId: maxEntry.interactionId,
          });
        }, 200);

        interactionMap.set(entry.interactionId, { entry: maxEntry, timeoutId });
      }
    };

    // 观察 'event' 类型，durationThreshold 默认为 40ms
    try {
      inpObserver = new PerformanceObserver(entryHandler);
      inpObserver.observe({ type: 'event', buffered: true });
    } catch (e) {
      console.warn('[CWJ Monitor] INP observation not supported:', e);
    }
  };

  const monitorLongTask = () => {
    const entryHandler = (list: { getEntries: () => any }) => {
      for (const entry of list.getEntries()) {
        if (options.filter && !options.filter(EMIT_TYPE.PERFORMANCE_LONGTASK, entry)) {
          continue;
        }
        // 长任务默认时间为50ms，这里提高阀值，减少日志噪音
        if (entry.duration > 100) {
          context?.emit(EMIT_TYPE.PERFORMANCE_LONGTASK, {
            startTime: entry.startTime,
            duration: entry.duration,
            name: entry.name,
            attribution: entry.attribution,
          });
        }
      }
    };

    try {
      longTaskObserver = new PerformanceObserver(entryHandler);
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      console.warn('[CWJ Monitor] Long Task observation not supported:', e);
    }
  };

  return {
    name: TYPES.PERFORMANCE,
    install: (ctx: PluginContext) => {
      context = ctx;
      monitorPaintMetrics();
      monitorLCP();
      monitorINP();
      monitorLongTask();
    },
    uninstall: () => {
      paintObserver?.disconnect();
      lcpObserver?.disconnect();
      inpObserver?.disconnect();
      longTaskObserver?.disconnect();
      // 清理所有待处理的 INP 定时器
      interactionMap.forEach((value) => clearTimeout(value.timeoutId));
      interactionMap.clear();
    },
  };
};
