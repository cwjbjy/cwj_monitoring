/**
 * SDK 收集的完整设备信息
 */
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

/**
 * 发送到监控后端的数据格式
 */
export interface MonitoringPayload {
  /** 设备信息 */
  device: Device;
  /** 唯一访客标识（指纹） */
  uuid: string;
  /** 事件类型 */
  type: string;
  /** 事件特定数据 */
  data: any;
  /** ISO 8601 格式的时间戳 */
  date: string;
  /** 用户自定义元数据 */
  userData?: Record<string, any>;
}

/**
 * 插件类型标识
 */
export type PluginType = 'error' | 'click' | 'performance' | 'router';

/**
 * 数据发送和批处理配置
 */
export interface TransportConfig {
  /**
   * 批量发送前的最大事件数
   * @default 5
   */
  maxBatchSize?: number;
  /**
   * 批量发送前的最大等待时间（毫秒）
   * @default 30000（30秒）
   */
  maxWaitTime?: number;
}

import type { IPlugin } from '../plugin/definePlugin';

/**
 * SDK 初始化配置选项
 */
export interface Options {
  /**
   * 发送监控数据的后端 URL
   * @required 必填
   */
  url: string;

  /**
   * 要启用的插件列表
   * @optional 可选
   */
  plugin?: IPlugin[];

  /**
   * 附加到所有事件的自定义用户元数据
   * 用于存储应用版本、环境、用户属性等
   * @optional 可选
   * @example { version: '1.2.3', env: 'production', userId: '12345' }
   */
  data?: Record<string, any>;

  /**
   * 传输/批处理配置
   * @optional 可选
   */
  transport?: TransportConfig;

  /**
   * 挂载在 window 上的全局变量名称
   * @default '$track'
   */
  globalKey?: string;
}
