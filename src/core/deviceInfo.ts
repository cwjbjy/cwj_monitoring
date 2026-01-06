import { nanoid } from 'nanoid';
import { getBrowserNameVersion } from '../utils';
import type { Device } from '../types/index';
import { UUID } from '../constant';

//基本信息
export default class DeviceInfo {
  device: Device;
  uuid: string = '';

  constructor(uuidKey: string = UUID) {
    //设备信息
    this.device = getBrowserNameVersion();
    this.getUUid(uuidKey);
  }

  private getUUid(key: string) {
    try {
      const uuid = localStorage.getItem(key);
      if (uuid) {
        this.uuid = uuid;
      } else {
        this.uuid = nanoid();
        localStorage.setItem(key, this.uuid);
      }
    } catch (e) {
      // 降级处理：如果 localStorage 不可用（如隐身模式），仅在内存中生成 UUID
      this.uuid = nanoid();
      console.warn('[CWJ Monitor] localStorage access failed, UUID will not be persisted:', e);
    }
  }
}
