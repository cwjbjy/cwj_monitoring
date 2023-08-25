import Error from "./error";
import pv from "./pv";
import behavior from "./behavior";
import performance from "./performance";
import updateFPS from "./fps";
import baseInfo from "./baseInfo";
import { MAX_CACHE_LEN, MAX_WAITING_TIME, UUID } from "./constant";
import { sendData } from "../utils";
import { Info ,Options} from "../types";

let url = ""; //上传url
let max = 0; //最大缓存数
let time = 0; //最大缓存时间
let events: Info[] = []; //存储的数据
let timer: NodeJS.Timeout; //定时器ID

let visitTime = Date.now();

export function send() {
  if (events.length) {
    sendData(url, events);
    events.splice(0, events.length); //发送完，数组置空
  }
}

export function emit(type: string, data?: any) {
  const date = Date.now();
  const info = Object.assign({}, baseInfo, {
    type, //类型
    data, //自定义数据
    date, //日期
    url: window.location.href, //当前路由
    referrer: document.referrer, //上一次的路由
    uuid: localStorage.getItem(UUID), //如果已经有uuid，则用之前的
  });
  if (type === "hashchange" || type === "historychange") {
    //停留时间 = 跳转时间 - 访问时间
    Object.assign(info, { duration: date - visitTime });
    visitTime = date;
  }
  events.push(info as Info);
  clearTimeout(timer);
  // 满足最大记录数,立即发送
  events.length >= max
    ? send()
    : (timer = setTimeout(() => {
        send();
      }, time));
}

function listenBeforeunload() {
  window.addEventListener("beforeunload", send, true);
}

export default function initBase(options:Options) {
  if (!options.url) {
    console.log("@web-tracing: ", "缺少参数url");
    return;
  }

  url = options.url;
  max = options.max || MAX_CACHE_LEN;
  time = options.time || MAX_WAITING_TIME;

  performance(); //监听性能
  //@ts-ignore
  updateFPS(); //监听fps
  Error(); //监听错误
  pv(); //监听路由
  behavior(); //监听用户行为
  listenBeforeunload(); //监听页面刷新或卸载
}
