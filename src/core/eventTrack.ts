import DeviceInfo from './deviceInfo';
import { getDate } from '../utils';
import type { Options, MonitoringPayload } from '../types/index';
import { EMIT_TYPE } from '../types/event';
import Reporter from './reporter';

/**
 * EventTrack 类处理事件收集和转换
 * 职责：
 * 1. 管理设备信息 (DeviceInfo)
 * 2. 格式化原始数据为 MonitoringPayload
 * 3. 将格式化后的数据交给 Reporter 发送
 */
export default class EventTrack {
  private deviceInfo: DeviceInfo;
  private reporter: Reporter;
  private data?: Record<string, any>;

  constructor(options: Options, reporter: Reporter) {
    this.deviceInfo = new DeviceInfo();
    this.reporter = reporter;
    this.data = options.data;
  }

  /**
   * 格式化事件数据用于传输
   */
  private formatter(type: EMIT_TYPE | string, data: any): MonitoringPayload {
    const timestamp = Date.now();
    return {
      device: this.deviceInfo.device,
      uuid: this.deviceInfo.uuid,
      type,
      data,
      date: getDate(timestamp),
      userData: this.data,
    };
  }

  /**
   * 公共方法：发送事件
   * 将事件格式化后交给 reporter 处理
   */
  public emit(type: EMIT_TYPE | string, data?: any): void {
    const payload = this.formatter(type, data);
    this.reporter.send(payload);
  }

  /**
   * 获取上报器实例 (供 Core 使用)
   */
  public getReporter(): Reporter {
    return this.reporter;
  }
}
