import { v4 as uuidv4 } from "uuid";
import Bowser from "bowser";
import { UUID } from "./constant";

//基本信息
export class BaseInfo {
  device: Bowser.Parser.ParsedResult;
  uuid: string;
  constructor() {
    this.device = Bowser.parse(window.navigator.userAgent); //设备信息
    if (!localStorage.getItem(UUID)) {
      this.uuid = uuidv4(); //唯一id;
      localStorage.setItem(UUID, this.uuid); //如果不存在uuid，则进行存储
    } else {
      this.uuid = localStorage.getItem(UUID) as string;
    }
  }
}

export default new BaseInfo();
