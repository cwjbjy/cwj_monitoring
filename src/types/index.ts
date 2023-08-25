export type BaseInfo = {
  device: {
    browser: {
      name: string;
      version: string;
    };
    engine: {
      name: string;
    };
    os: {
      name: string;
      version: string;
      versionName: string;
    };
    platform: {
      type: string;
    };
  };
  uuid: string;
};

//传给接口的数据格式
export type Info = BaseInfo & {
  type: string;
  data: any;
  date: number;
  url: string;
  referrer: string;
  uuid: string | null;
};

//初始化时传入的参数
export type Options = {
  url: string;
  max?: number;
  time?: number;
};
