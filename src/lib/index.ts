import ErrorPlugin from './plugin/error';
import PVPlugin from './plugin/pv';
import BehaviorPlugin from './plugin/behavior';
import PerformancePlugin from './plugin/performance';
import EventTrack from './eventTrack';
import Validator from '../utils/validator';
import { TYPES } from '../types/event';
import type { Options } from '../types/index';

export let track: EventTrack;

export default function initBase(options: Options) {
  if (!Validator.validate(options)) return;

  track = new EventTrack(options);
  window.$track = track;

  start(options);

  //页面刷新或卸载前主动发送数据
  window.addEventListener('beforeunload', track.send, true);
}

//根据参数启动对应的监听功能
/* 工厂模式 */
function start(options: Options) {
  const plugins = options.plugin;
  if (plugins) {
    plugins.forEach((plugin) => {
      switch (plugin) {
        case TYPES.CLICK:
          BehaviorPlugin.monitor(); //监听用户行为
          break;
        case TYPES.ERROR:
          ErrorPlugin.monitor(); //监听错误
          break;
        case TYPES.PERFORMANCE:
          PerformancePlugin.monitor(); //监听性能
          break;
        case TYPES.ROUTER:
          PVPlugin.monitor(); //监听路由
          break;
        default:
          break;
      }
    });
  }
}
