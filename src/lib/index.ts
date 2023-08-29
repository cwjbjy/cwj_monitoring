import Error from "./error";
import pv from "./pv";
import behavior from "./behavior";
import performance from "./performance";
import updateFPS from "./fps";
import baseInfo from "./baseInfo";
import { MAX_CACHE_LEN, MAX_WAITING_TIME, UUID } from "./constant";
import { sendData } from "../utils";
import events from "./cache";
import type { Options } from "../types";
class EventTrack {
  private url: string; //上报地址
  private max: number; //最大缓存数
  private time: number; //最大缓存时间
  private timer: NodeJS.Timeout | undefined; //定时器ID
  private visitTime: number; //初始化时间

  constructor(options: Options) {
    this.url = options.url;
    this.max = options.max || MAX_CACHE_LEN;
    this.time = options.time || MAX_WAITING_TIME;
    this.timer;
    this.visitTime = Date.now();
  }

  //格式化传输数据
  formatter(type: string, data: any) {
    const date = Date.now();
    const info = Object.assign({}, baseInfo, {
      type, //类型
      data, //自定义数据
      date, //日期
      url: window.location.href, //当前路由
      referrer: document.referrer, //上一次的路由
      uuid: localStorage.getItem(UUID), //如果已经有uuid，则用之前的
      duration: date - this.visitTime,
    });
    this.visitTime = date;
    return info;
  }

  send() {
    if (events.getCacheLength()) {
      sendData(this.url, events.cache);
      events.clearCache(); //发送完，数组置空
    }
  }

  emit(type: string, data?: any) {
    const info = this.formatter(type, data);
    events.addCache(info);
    clearTimeout(this.timer);
    // 满足最大记录数,立即发送
    events.getCacheLength() >= this.max
      ? this.send()
      : (this.timer = setTimeout(() => {
          this.send();
        }, this.time));
  }
}

export let track: EventTrack;

export default function initBase(options: Options) {
  if (!options.url) {
    console.log("@web-tracing: ", "缺少参数url");
    return;
  }

  track = new EventTrack(options);
  (window as any).$track = track;

  performance(); //监听性能
  //@ts-ignore
  updateFPS(); //监听fps
  Error(); //监听错误
  pv(); //监听路由
  behavior(); //监听用户行为
  window.addEventListener("beforeunload", track.send, true);
}
