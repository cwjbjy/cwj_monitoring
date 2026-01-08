import { IPlugin, PluginContext } from './definePlugin';
import { EMIT_TYPE, TYPES } from '../types/event';
import { isIgnoredScriptSource } from '../utils/common';

import { DEFAULT_LOAF_THRESHOLD, DEFAULT_RESOURCE_THRESHOLD, DEFAULT_LOAF_SINGLETIME } from '../constant';

export interface PerformanceOptions {
  /** 过滤函数，返回 false 则不记录该性能指标 */
  filter?: (type: EMIT_TYPE, value: any) => boolean;
  /** 长任务阈值 (ms)，超过此值则上报，默认 100 */
  longTaskThreshold?: number;
  /** 资源加载阈值 (ms)，超过此值则上报，默认 1000 */
  resourceThreshold?: number;
  /** INP 阈值 (ms)，超过此值则上报，默认 200 */
  inpThreshold?: number;
  /** LoAF 阈值 (ms)，超过此值则上报，默认 100 */
  loafThreshold?: number;
}

export const PerformancePlugin = (options: PerformanceOptions = {}): IPlugin => {
  let context: PluginContext;
  let paintObserver: PerformanceObserver | null = null;
  let lcpObserver: PerformanceObserver | null = null;
  let resourceObserver: PerformanceObserver | null = null;
  let loafObserver: PerformanceObserver | null = null;

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

  const monitorLoAF = () => {
    const entryHandler = (list: { getEntries: () => any }) => {
      for (const entry of list.getEntries()) {
        if (options.filter && !options.filter(EMIT_TYPE.PERFORMANCE_LOAF, entry)) {
          continue;
        }

        const threshold = options.loafThreshold ?? DEFAULT_LOAF_THRESHOLD;

        // 快速过滤：只关注长耗时条目
        if (typeof entry.duration !== 'number' || entry.duration <= threshold) continue;

        const scripts = Array.isArray(entry.scripts) ? entry.scripts : [];
        let isUserTriggered = false;
        let allIgnored = true; // 是否所有脚本都属于忽略的来源

        for (let i = 0; i < scripts.length; i++) {
          const s = scripts[i];
          if (!s) continue;

          if (!isUserTriggered && s.invokerType === 'user-callback') isUserTriggered = true;

          if (allIgnored && !isIgnoredScriptSource(s.sourceURL)) {
            allIgnored = false;
          }

          // 若已发现用户触发且存在非忽略来源，可提前退出
          if (isUserTriggered && !allIgnored) break;
        }

        /* 
        invokerType 类型：
          classic-script	传统脚本	同步/异步执行，无模块系统	<script src="app.js">
          module-script	ES6模块	支持import/export	<script type="module">
          user-callback	用户回调	事件处理器、定时器等	addEventListener回调
          event-listener	事件监听	特定DOM事件	click, scroll等
        */

        if (isUserTriggered && !allIgnored) {
          const baseInfo = {
            duration: entry.duration,
            startTime: entry.startTime,
            renderStart: entry.renderStart,
            styleAndLayoutStart: entry.styleAndLayoutStart,
            hadRecentInput: entry.hadRecentInput,
            scripts: entry.scripts.map((s: any) => ({
              duration: s.duration,
              invoker: s.invoker,
              invokerType: s.invokerType,
              sourceURL: s.sourceURL,
              functionName: s.functionName,
              sourceFunctionName: s.sourceFunctionName,
              sourceCharPosition: s.sourceCharPosition,
              startTime: s.startTime,
            })),
          };

          // 对于耗时超过 50ms 的脚本，异步 fetch 其 sourceURL 并提取位置上下文
          (async () => {
            const longScripts = scripts.filter(
              (s: any) => s && typeof s.duration === 'number' && s.duration > DEFAULT_LOAF_SINGLETIME && s.sourceURL,
            );
            const contexts: Array<{ sourceURL: string; position?: number; snippet?: string; error?: string }> = [];

            for (const s of longScripts) {
              try {
                const url = String(s.sourceURL);
                // fetch 资源（CORS 可能会阻止，捕获错误）
                const resp = await fetch(url, { cache: 'no-store' });
                if (!resp.ok) {
                  contexts.push({ sourceURL: url, error: `http ${resp.status}` });
                  continue;
                }
                const text = await resp.text();
                const pos = typeof s.sourceCharPosition === 'number' ? s.sourceCharPosition : undefined;
                if (pos !== undefined && Number.isFinite(pos)) {
                  const start = Math.max(0, pos - 50);
                  const end = Math.min(text.length, pos + 50);
                  const snippet = text.substring(start, end);
                  contexts.push({ sourceURL: url, position: pos, snippet });
                } else {
                  contexts.push({ sourceURL: url, error: 'no-position' });
                }
              } catch (e: any) {
                contexts.push({
                  sourceURL: s && s.sourceURL ? String(s.sourceURL) : '',
                  error: e?.message || String(e),
                });
              }
            }

            const info = { ...baseInfo, contexts };

            context?.emit(EMIT_TYPE.PERFORMANCE_LOAF, info);
          })();
        }
      }
    };

    try {
      loafObserver = new PerformanceObserver(entryHandler);
      loafObserver.observe({ type: 'long-animation-frame', buffered: true });
    } catch (e) {
      console.warn('[CWJ Monitor] LoAF observation not supported:', e);
    }
  };

  const monitorResource = () => {
    const entryHandler = (list: { getEntries: () => any }) => {
      for (const entry of list.getEntries()) {
        // 只监听 fetch 与 xmlhttprequest
        if (entry.initiatorType !== 'fetch' && entry.initiatorType !== 'xmlhttprequest') {
          continue;
        }

        if (options.filter && !options.filter(EMIT_TYPE.PERFORMANCE_RESOURCE, entry)) {
          continue;
        }

        // 资源加载时间超过阈值，上报
        const threshold = options.resourceThreshold ?? DEFAULT_RESOURCE_THRESHOLD;
        if (entry.duration > threshold) {
          context?.emit(EMIT_TYPE.PERFORMANCE_RESOURCE, {
            name: entry.name, // 资源 URL
            initiatorType: entry.initiatorType,
            duration: entry.duration,
            startTime: entry.startTime,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
          });
        }
      }
    };

    try {
      resourceObserver = new PerformanceObserver(entryHandler);
      resourceObserver.observe({ type: 'resource', buffered: true });
    } catch (e) {
      console.warn('[CWJ Monitor] Resource observation not supported:', e);
    }
  };

  return {
    name: TYPES.PERFORMANCE,
    install: (ctx: PluginContext) => {
      context = ctx;
      monitorPaintMetrics();
      monitorLCP();
      monitorResource();
      monitorLoAF();
    },
    uninstall: () => {
      paintObserver?.disconnect();
      lcpObserver?.disconnect();
      resourceObserver?.disconnect();
      loafObserver?.disconnect();
    },
  };
};
