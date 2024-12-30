import DeviceInfo from './deviceInfo';
import { MAX_CACHE_LEN, MAX_WAITING_TIME, UUID } from './constant';
import { nextTime, beforeUnload, getDate, getSeconds } from '../utils';

import type { Options, Info } from '../types/index';

import { EMIT_RTYPE } from '../types/event';

export default class EventTrack extends DeviceInfo {
  private url: string; //上报地址
  private max: number; //最大缓存数
  private time: number; //最大缓存时间
  private timer: NodeJS.Timeout | undefined; //定时器ID
  private visitTime: number; //初始化时间
  private data: any; //外部传入的参数，可存储项目版本信息
  private events: Info[]; //事件

  constructor(options: Options) {
    super();
    this.url = options.url;
    this.max = options.max || MAX_CACHE_LEN;
    this.time = options.time || MAX_WAITING_TIME;
    this.timer;
    this.visitTime = Date.now();
    this.data = options.data;
    this.events = [];
    beforeUnload(this.send.bind(this, true));
  }

  //格式化传输数据
  formatter(type: EMIT_RTYPE, data: any) {
    const date = Date.now();
    const info = Object.assign(
      {},
      { device: this.device, uuid: this.uuid },
      {
        type, //类型
        data, //自定义数据
        date: getDate(date), //日期
        url: window.location.href, //当前路由
        referrer: document.referrer, //上一次的路由
        uuid: localStorage.getItem(UUID), //如果已经有uuid，则用之前的
        duration: getSeconds(date, this.visitTime),
        userData: this.data,
      },
    );
    this.visitTime = date;
    return info;
  }

  send(flush: boolean) {
    if (this.events.length) {
      console.log('this.events', this.events);
      // 如果是刷新/卸载直接同步全部发送
      const maxLen = flush ? this.events.length : this.max;
      // 需要发送的事件
      const sendEvents = this.events.slice(0, maxLen);
      // 待发事件
      this.events = this.events.slice(maxLen);
      this.safeSend(sendEvents);
      // 选择下一个待发送的合适时机
      if (this.events.length) nextTime(this.send.bind(this, false));
    }
  }

  emit(type: EMIT_RTYPE, data?: any) {
    const info = this.formatter(type, data);
    console.log('info', info);
    this.events.push(info);
    this.timer && clearTimeout(this.timer);
    // 满足最大记录数,立即发送
    this.events.length >= this.max
      ? this.send(false)
      : (this.timer = setTimeout(() => {
          this.send(false);
        }, this.time));
  }

  private safeSend(events: Info[]) {
    // 1.用navigator.sendBeacon
    if (!events.length) return;
    if (window.navigator.sendBeacon instanceof Function) {
      window.navigator.sendBeacon(this.url, JSON.stringify(events));
    } else {
      // 2.XMLHttpRequest兜底
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.url, true);
      xhr.send(JSON.stringify(events));
    }
  }
}
