import { track } from '../index';
import DefinePlugin from './definePlugin';

class PerformancePlugin extends DefinePlugin {
  constructor() {
    super('performance');
  }

  monitor(): void {
    this.fp(); //首次渲染时间
    this.dcl(); //DOM加载完成时间
    this.load(); //样式表与图片都加载完成时间
  }

  fp() {
    const entryHandler = (list: { getEntries: () => any }) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-paint') {
          observer.disconnect();
          track.emit('performance_fp', entry.startTime);
        }
      }
    };

    const observer = new PerformanceObserver(entryHandler);
    // buffered 属性表示是否观察缓存数据，也就是说观察代码添加时机比事情触发时机晚也没关系。
    observer.observe({ type: 'paint', buffered: true });
  }

  dcl() {
    window.addEventListener('DOMContentLoaded', function (e) {
      track.emit('performance_DOMContentLoaded', e.timeStamp);
    });
  }

  load() {
    window.addEventListener('load', function (e) {
      track.emit('performance_load', e.timeStamp);
    });
  }
}

export default new PerformancePlugin();
