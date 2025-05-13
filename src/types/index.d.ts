export interface Device {
  /** 浏览器信息 */
  browser: {
    name?: string;
    version?: string;
  };
  /** 操作系统 */
  os: {
    name?: string;
    version?: string;
    versionName?: string;
  };
  /** 设备种类 */
  platform: {
    type?: string;
  };
  /** 浏览器缩放比例 */
  ratio: number;
  /** 浏览器宽高 */
  wh: {
    /** 浏览器宽 */
    width: number;
    /** 浏览器高 */
    height: number;
  };
}

//传给接口的数据格式
export interface Info {
  device: Device;
  uuid: string;
  type: string;
  data: any;
  date: string;
}

type Plugin = 'error' | 'click' | 'performance' | 'router';

//初始化时传入的参数
export interface Options {
  url: string;
  max?: number;
  time?: number;
  plugin?: Plugin[];
  data?: any;
}
