import { track } from '../index';
import DefinePlugin from './definePlugin';
import { EMIT_RTYPE } from '../../types/event';

class PerformancePlugin extends DefinePlugin {
  constructor() {
    super('performance');
  }

  monitor(): void {
    this.paint(); //第一个像素和内容渲染时间
    this.lcp(); //页面最大内容渲染时间
    this.dcl(); //DOM加载完成时间
    this.load(); //样式表与图片都加载完成时间
  }

  paint() {
    const entryHandler = (list: { getEntries: () => any }) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-paint') {
          track.emit(EMIT_RTYPE.PERFORMANCE_FP, entry.startTime);
        } else if (entry.name === 'first-contentful-paint') {
          track.emit(EMIT_RTYPE.PERFORMANCE_FCP, entry.startTime);
        }
      }
      observer.disconnect();
    };

    const observer = new PerformanceObserver(entryHandler);
    // buffered 属性表示是否观察缓存数据，也就是说观察代码添加时机比事情触发时机晚也没关系。
    observer.observe({ type: 'paint', buffered: true });
  }

  lcp() {
    const entryHandler = (list: { getEntries: () => any }) => {
      if (observer) {
        observer.disconnect();
      }

      for (const entry of list.getEntries()) {
        track.emit(EMIT_RTYPE.PERFORMANCE_LCP, entry.startTime);
      }
    };

    const observer = new PerformanceObserver(entryHandler);
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  dcl() {
    window.addEventListener('DOMContentLoaded', function (e) {
      track.emit(EMIT_RTYPE.PERFORMANCE_DOMCONTENTLOADED, e.timeStamp);
    });
  }

  load() {
    window.addEventListener('load', function (e) {
      track.emit(EMIT_RTYPE.PERFORMANCE_LOAD, e.timeStamp);
    });
  }
}

export default new PerformancePlugin();
