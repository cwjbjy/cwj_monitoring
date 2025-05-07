import Core from '../core';
import DefinePlugin from './definePlugin';
import { EMIT_TYPE } from '../types/event';
import { TYPES } from '../types/event';

class PerformancePlugin extends DefinePlugin {
  constructor() {
    super(TYPES.PERFORMANCE);
  }

  install(track: Core): void {
    this.track = track;
    this.setupPerformanceMonitoring();
  }

  private setupPerformanceMonitoring() {
    this.monitorPaintMetrics(); // FP/FCP
    this.monitorLCP(); // LCP
    this.monitorDCL(); // DOMContentLoaded
    this.monitorLoad(); // Load
    // this.monitorFPS(); // 帧率监控 // 不建议使用，会影响性能
  }

  private monitorPaintMetrics() {
    const entryHandler = (list: { getEntries: () => any }) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-paint') {
          this.track?.emit(EMIT_TYPE.PERFORMANCE_FP, entry.startTime);
        } else if (entry.name === 'first-contentful-paint') {
          this.track?.emit(EMIT_TYPE.PERFORMANCE_FCP, entry.startTime);
        }
      }
      observer.disconnect();
    };

    const observer = new PerformanceObserver(entryHandler);
    // buffered 属性表示是否观察缓存数据，也就是说观察代码添加时机比事情触发时机晚也没关系。
    observer.observe({ type: 'paint', buffered: true });
  }

  private monitorLCP() {
    const entryHandler = (list: { getEntries: () => any }) => {
      if (observer) {
        observer.disconnect();
      }

      for (const entry of list.getEntries()) {
        this.track?.emit(EMIT_TYPE.PERFORMANCE_LCP, entry.startTime);
      }
    };

    const observer = new PerformanceObserver(entryHandler);
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  private monitorDCL() {
    window.addEventListener('DOMContentLoaded', (e) => {
      this.track?.emit(EMIT_TYPE.PERFORMANCE_DOMCONTENTLOADED, e.timeStamp);
    });
  }

  private monitorLoad() {
    window.addEventListener('load', (e) => {
      this.track?.emit(EMIT_TYPE.PERFORMANCE_LOAD, e.timeStamp);
    });
  }

  // private monitorFPS() {
  //   let lastTime = performance.now();
  //   let frameCount = 0;
  //   let fps = 0;

  //   const calculateFPS = (now: DOMHighResTimeStamp) => {
  //     frameCount++;

  //     if (now > lastTime + 1000) {
  //       fps = Math.round((frameCount * 1000) / (now - lastTime));
  //       this.track?.emit(EMIT_TYPE.PERFORMANCE_FPS, {
  //         value: fps,
  //         timestamp: now,
  //       });

  //       frameCount = 0;
  //       lastTime = now;
  //     }

  //     requestAnimationFrame(calculateFPS);
  //   };

  //   requestAnimationFrame(calculateFPS);
  // }
}

export default new PerformancePlugin();
