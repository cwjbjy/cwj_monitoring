export interface Device {
  browser: string; //浏览器名称
  browser_version: string | undefined; //浏览器版本
  os: string; //操作系统
  ratio: number; //浏览器缩放比例
  width: number; //浏览器宽
  height: number; //浏览器高
}

export interface BaseInfo {
  device: Device;
  uuid: string;
}

//传给接口的数据格式
export interface Info extends BaseInfo {
  type: string;
  data: any;
  date: string;
  url: string;
  referrer: string;
}

export interface Monitor {
  error?: boolean;
  click?: boolean;
  performance?: boolean;
  router?: boolean;
}

//初始化时传入的参数
export interface Options extends Monitor {
  url: string;
  max?: number;
  time?: number;
  data?: any;
}
