import { getBrowserNameVersion } from '../utils';
import type { Device } from '../types/index';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

//基本信息
export default class DeviceInfo {
  device: Device;
  uuid: string = '';
  constructor() {
    //设备信息
    this.device = getBrowserNameVersion();
    this.getUUid();
  }

  private async getUUid() {
    const result = await FingerprintJS.load();
    const visitorId = await result.get();
    // 生成一个唯一的 UUID
    this.uuid = visitorId.visitorId;
  }
}
