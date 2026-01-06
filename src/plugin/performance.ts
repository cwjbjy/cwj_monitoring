import DefinePlugin, { PluginContext } from './definePlugin';
import { EMIT_TYPE } from '../types/event';
import { TYPES } from '../types/event';

export interface PerformanceOptions {
  /** 过滤函数，返回 false 则不记录该性能指标 */
  filter?: (type: EMIT_TYPE, value: any) => boolean;
}

export class PerformancePlugin extends DefinePlugin {
  private options: PerformanceOptions;

  constructor(options: PerformanceOptions = {}) {
    super(TYPES.PERFORMANCE);
    this.options = options;
  }

  install(context: PluginContext): void {
    this.context = context;
    this.setupPerformanceMonitoring();
  }

  private setupPerformanceMonitoring() {
    this.monitorPaintMetrics(); // FP/FCP
    this.monitorLCP(); // LCP
    this.monitorDCL(); // DOMContentLoaded
    this.monitorLoad(); // Load
  }

  private monitorPaintMetrics() {
    const entryHandler = (list: { getEntries: () => any }) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-paint') {
          if (this.options.filter && !this.options.filter(EMIT_TYPE.PERFORMANCE_FP, entry.startTime)) {
            continue;
          }
          this.context?.emit(EMIT_TYPE.PERFORMANCE_FP, entry.startTime);
        } else if (entry.name === 'first-contentful-paint') {
          if (this.options.filter && !this.options.filter(EMIT_TYPE.PERFORMANCE_FCP, entry.startTime)) {
            continue;
          }
          this.context?.emit(EMIT_TYPE.PERFORMANCE_FCP, entry.startTime);
        }
      }
      observer.disconnect();
    };

    const observer = new PerformanceObserver(entryHandler);
    observer.observe({ type: 'paint', buffered: true });
  }

  private monitorLCP() {
    const entryHandler = (list: { getEntries: () => any }) => {
      if (observer) {
        observer.disconnect();
      }

      for (const entry of list.getEntries()) {
        if (this.options.filter && !this.options.filter(EMIT_TYPE.PERFORMANCE_LCP, entry.startTime)) {
          continue;
        }
        this.context?.emit(EMIT_TYPE.PERFORMANCE_LCP, entry.startTime);
      }
    };

    const observer = new PerformanceObserver(entryHandler);
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  private monitorDCL() {
    window.addEventListener('DOMContentLoaded', (e) => {
      if (this.options.filter && !this.options.filter(EMIT_TYPE.PERFORMANCE_DOMCONTENTLOADED, e.timeStamp)) {
        return;
      }
      this.context?.emit(EMIT_TYPE.PERFORMANCE_DOMCONTENTLOADED, e.timeStamp);
    });
  }

  private monitorLoad() {
    window.addEventListener('load', (e) => {
      if (this.options.filter && !this.options.filter(EMIT_TYPE.PERFORMANCE_LOAD, e.timeStamp)) {
        return;
      }
      this.context?.emit(EMIT_TYPE.PERFORMANCE_LOAD, e.timeStamp);
    });
  }
}
