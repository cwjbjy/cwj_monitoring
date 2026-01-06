import DeviceInfo from './deviceInfo';
import { MAX_CACHE_LEN, MAX_WAITING_TIME } from '../constant';
import { nextTime, beforeUnload, getDate } from '../utils';

import type { Options, MonitoringPayload, TransportConfig } from '../types/index';
import { EMIT_TYPE } from '../types/event';

/**
 * EventTrack 类处理事件收集、批处理和传输
 */
export default class EventTrack {
  public url: string;

  private deviceInfo: DeviceInfo;
  private transportConfig: Required<TransportConfig>;
  private data?: Record<string, any>;
  private events: MonitoringPayload[] = [];
  private isSending = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: Options) {
    this.deviceInfo = new DeviceInfo();
    this.url = options.url;
    this.data = options.data;

    // 合并传输配置和默认值
    this.transportConfig = {
      maxBatchSize: options.transport?.maxBatchSize ?? MAX_CACHE_LEN,
      maxWaitTime: options.transport?.maxWaitTime ?? MAX_WAITING_TIME,
    };

    // 页面卸载前刷新事件
    beforeUnload(() => this.flush());
  }

  /**
   * 格式化事件数据用于传输
   */
  private formatter(type: EMIT_TYPE | string, data: any): MonitoringPayload {
    const timestamp = Date.now();
    const payload: MonitoringPayload = {
      device: this.deviceInfo.device,
      uuid: this.deviceInfo.uuid,
      type,
      data,
      date: getDate(timestamp),
      userData: this.data,
    };

    return payload;
  }

  /**
   * 使用重试逻辑发送事件
   */
  private async send(flush = false): Promise<void> {
    if (this.isSending || !this.events.length) return;

    this.isSending = true;

    try {
      const maxLen = flush ? this.events.length : this.transportConfig.maxBatchSize;
      const sendEvents = this.events.slice(0, maxLen);
      this.events = this.events.slice(maxLen);

      await this.safeSend(sendEvents);

      // 如果还有剩余事件，调度下次发送
      if (this.events.length) {
        nextTime(() => this.send());
      }
    } catch (error) {
      // 注意：不重新添加到队列以防止无限循环
    } finally {
      this.isSending = false;
    }
  }

  /**
   * 立即刷新所有待发送事件
   */
  private flush(): Promise<void> {
    return this.send(true);
  }

  /**
   * 公共方法：发送事件
   */
  emit(type: EMIT_TYPE | string, data?: any): void {
    const info = this.formatter(type, data);
    this.events.push(info);

    // 达到最大批处理大小时立即发送，否则通过定时器发送
    if (this.events.length >= this.transportConfig.maxBatchSize) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.send();
    } else if (!this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.send();
      }, this.transportConfig.maxWaitTime);
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

    xhr.onerror = () => {
      reject(new Error('Network error'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Request timeout'));
    };

    xhr.timeout = 10000; // 10秒超时
    xhr.send(data);
  }
}
