import DeviceInfo from './deviceInfo';
import { MAX_CACHE_LEN, MAX_WAITING_TIME } from '../constant';
import { nextTime, beforeUnload, getDate } from '../utils';

import type { Options, Info } from '../types/index';

import { EMIT_TYPE } from '../types/event';

export default class EventTrack extends DeviceInfo {
  private url: string; //上报地址
  private max: number; //最大缓存数
  private time: number; //最大缓存时间
  private timer: NodeJS.Timeout | null = null; //定时器ID
  private data: any; //外部传入的参数，可存储项目版本信息
  private events: Info[] = []; //事件
  private isSending = false; //是否正在发送

  constructor(options: Options) {
    super();
    this.url = options.url;
    this.max = options.max || MAX_CACHE_LEN;
    this.time = options.time || MAX_WAITING_TIME;
    this.data = options.data;
    beforeUnload(() => this.flush());
  }

  //格式化传输数据
  private formatter(type: EMIT_TYPE, data: any) {
    const date = Date.now();
    const info = Object.assign(
      {},
      { device: this.device, uuid: this.uuid },
      {
        type, //类型
        data, //自定义数据
        date: getDate(date), //日期
        userData: this.data, //用户自定义数据
      },
    );
    return info;
  }

  private async send(flush = false): Promise<void> {
    if (this.isSending || !this.events.length) return;

    this.isSending = true;

    try {
      // 如果是刷新/卸载直接同步全部发送
      const maxLen = flush ? this.events.length : this.max;
      // 需要发送的事件
      const sendEvents = this.events.slice(0, maxLen);
      // 待发事件
      this.events = this.events.slice(maxLen);
      await this.safeSend(sendEvents);
      // 选择下一个待发送的合适时机
      if (this.events.length) nextTime(() => this.send());
    } finally {
      this.isSending = false;
    }
  }

  private flush(): Promise<void> {
    return this.send(true);
  }

  emit(type: EMIT_TYPE, data?: any) {
    const info = this.formatter(type, data);
    // console.log('info', info);
    this.events.push(info);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    // 满足最大记录数,立即发送
    this.events.length >= this.max
      ? this.send()
      : (this.timer = setTimeout(() => {
          this.send();
        }, this.time));
  }

  private safeSend(events: Info[]) {
    if (!events.length) return;

    const data = JSON.stringify(events);

    // 1.用navigator.sendBeacon
    if (window.navigator.sendBeacon instanceof Function) {
      window.navigator.sendBeacon(this.url, data);
    } else {
      // 2.XMLHttpRequest兜底
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.url, true);
      xhr.send(data);
    }
  }
}
