import { v4 as uuidv4 } from "uuid";
import { UUID } from "./constant";
import { getBrowserNameVersion, getRatio, getOs, getWH } from "../utils/device";
import type { Device } from "../types/index";

//基本信息
export default class BaseInfo {
  device: Device;
  uuid: string;
  constructor() {
    //设备信息
    this.device = Object.assign({}, getBrowserNameVersion(), getWH(), {
      ratio: getRatio(),
      os: getOs(),
    });
    if (!localStorage.getItem(UUID)) {
      this.uuid = uuidv4(); //唯一id;
      localStorage.setItem(UUID, this.uuid); //如果不存在uuid，则进行存储
    } else {
      this.uuid = localStorage.getItem(UUID) as string;
    }
  }
}


