import { MAX_CACHE_LEN, MAX_WAITING_TIME } from '../constant';
import { nextTime, beforeUnload } from '../utils';
import type { MonitoringPayload, TransportConfig } from '../types/index';

/**
 * Reporter 类负责数据的批量上报、重试和调度
 */
export default class Reporter {
  private url: string;
  private transportConfig: Required<TransportConfig>;
  private events: MonitoringPayload[] = [];
  private isSending = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string, config?: TransportConfig) {
    this.url = url;
    this.transportConfig = {
      maxBatchSize: config?.maxBatchSize ?? MAX_CACHE_LEN,
      maxWaitTime: config?.maxWaitTime ?? MAX_WAITING_TIME,
    };

    // 页面卸载前刷新事件
    beforeUnload(() => this.flush());
  }

  /**
   * 将事件加入队列
   */
  public send(payload: MonitoringPayload) {
    this.events.push(payload);

    // 达到最大批处理大小时立即发送，否则通过定时器发送
    if (this.events.length >= this.transportConfig.maxBatchSize) {
      this.clearTimer();
      this.triggerSend();
    } else if (!this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.triggerSend();
      }, this.transportConfig.maxWaitTime);
    }
  }

  /**
   * 立即刷新所有待发送事件
   */
  public flush(): Promise<void> {
    return this.triggerSend(true);
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * 触发发送逻辑
   */
  private async triggerSend(isFlush = false): Promise<void> {
    if (this.isSending || !this.events.length) return;

    this.isSending = true;

    try {
      const maxLen = isFlush ? this.events.length : this.transportConfig.maxBatchSize;
      const sendEvents = this.events.slice(0, maxLen);
      this.events = this.events.slice(maxLen);

      await this.safeSend(sendEvents);

      // 如果还有剩余事件，调度下次发送
      if (this.events.length) {
        nextTime(() => this.triggerSend());
      }
    } catch {
      // 失败处理逻辑，目前简单忽略
    } finally {
      this.isSending = false;
    }
  }

  /**
   * 使用 navigator.sendBeacon 或 XMLHttpRequest 安全发送事件
   */
  private safeSend(events: MonitoringPayload[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!events.length) {
        resolve();
        return;
      }

      const data = JSON.stringify(events);

      // 优先尝试 sendBeacon（更适合页面卸载）
      if (typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([data], { type: 'application/json' });
        const success = navigator.sendBeacon(this.url, blob);

        if (success) {
          resolve();
        } else {
          this.sendViaXHR(data, resolve, reject);
        }
      } else {
        // 降级到 XMLHttpRequest
        this.sendViaXHR(data, resolve, reject);
      }
    });
  }

  /**
   * 通过 XMLHttpRequest 发送
   */
  private sendViaXHR(data: string, resolve: () => void, reject: (error: Error) => void): void {
    const xhr = new XMLHttpRequest();

    xhr.open('POST', this.url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Request timeout'));

    xhr.timeout = 10000;
    xhr.send(data);
  }
}
