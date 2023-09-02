import ErrorPlugin from "./plugin/error";
import PVPlugin from "./plugin/pv";
import BehaviorPlugin from "./plugin/behavior";
import PerformancePlugin from "./plugin/performance";
import EventTrack from "./eventTrack";
import { isValidKey } from "../utils/index";
import { EVENTTYPES } from "../types/event";
import type { Options } from "../types/index";

export let track: EventTrack;

export default function initBase(options: Options) {
  if (!options.url) {
    console.error("@web-tracing: ", "缺少参数url");
    return;
  }

  track = new EventTrack(options);
  window.$track = track;

  start(options);

  //页面刷新或卸载前主动发送数据
  window.addEventListener("beforeunload", track.send, true);
}

//根据参数启动对应的监听功能
function start(options: Options) {
  const monitorParams = Object.assign(
    {
      error: true,
      click: true,
      performance: true,
      router: true,
    },
    options
  );
  for (const key in monitorParams) {
    if (isValidKey(key, monitorParams)) {
      if (monitorParams[key]) {
        switch (key) {
          case EVENTTYPES.CLICK:
            BehaviorPlugin.monitor(); //监听用户行为
            break;
          case EVENTTYPES.ERROR:
            ErrorPlugin.monitor(); //监听错误
            break;
          case EVENTTYPES.PERFORMANCE:
            PerformancePlugin.monitor(); //监听性能
            break;
          case EVENTTYPES.ROUTER:
            PVPlugin.monitor(); //监听路由
            break;
          default:
            break;
        }
      }
    }
  }
}
