import BaseInfo from './baseInfo';
import { MAX_CACHE_LEN, MAX_WAITING_TIME, UUID } from './constant';
import { sendData, getErrorId } from '../utils';
import events from './cache';
import { getDate, getSeconds } from '../utils/date';

import type { Options } from '../types/index';

import { EMIT_RTYPE } from '../types/event';

export default class EventTrack extends BaseInfo {
  private url: string; //上报地址
  private max: number; //最大缓存数
  private time: number; //最大缓存时间
  private timer: NodeJS.Timeout | undefined; //定时器ID
  private visitTime: number; //初始化时间
  private data: any;

  constructor(options: Options) {
    super();
    this.url = options.url;
    this.max = options.max || MAX_CACHE_LEN;
    this.time = options.time || MAX_WAITING_TIME;
    this.timer;
    this.visitTime = Date.now();
    this.data = options.data;
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
        userData: this.data, //外部传入的参数
        id: '', //日志id
      },
    );
    //给错误记录根据内容添加唯一id
    if ([EMIT_RTYPE.ERROR_JS, EMIT_RTYPE.ERROR_PROMISE].includes(type)) {
      Object.assign(info, { id: getErrorId(data.message) });
    }
    this.visitTime = date;
    return info;
  }

  send() {
    if (events.getLength()) {
      sendData(this.url, events.cache);
      events.clear(); //发送完，数组置空
    }
  }

  emit(type: EMIT_RTYPE, data?: any) {
    const info = this.formatter(type, data);
    if (!events.cache.filter((o) => o.id).some((o) => o.id === info.id)) {
      events.add(info);
    }
    clearTimeout(this.timer);
    // 满足最大记录数,立即发送
    events.getLength() >= this.max
      ? this.send()
      : (this.timer = setTimeout(() => {
          this.send();
        }, this.time));
  }
}
