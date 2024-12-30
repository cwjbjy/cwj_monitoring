import { v4 as uuidv4 } from 'uuid';
import { UUID } from './constant';
import { getBrowserNameVersion } from '../utils/device';
import type { Device } from '../types/index';

//基本信息
export default class DeviceInfo {
  device: Device;
  uuid: string;
  constructor() {
    //设备信息
    this.device = getBrowserNameVersion();
    if (!localStorage.getItem(UUID)) {
      this.uuid = uuidv4(); //唯一id;
      localStorage.setItem(UUID, this.uuid); //如果不存在uuid，则进行存储
    } else {
      this.uuid = localStorage.getItem(UUID) as string;
    }
  }
}
