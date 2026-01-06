import { EMIT_TYPE } from '../types/event';

/**
 * 插件执行上下文
 * 提供插件所需的最小功能集，实现插件与核心实例的解耦
 */
export interface PluginContext {
  /** 发送事件 */
  emit: (type: EMIT_TYPE | string, data: any) => void;
  /** 监控上报地址（用于网络插件过滤） */
  url: string;
}

/**
 * 基础插件接口
 * 所有监控插件必须实现此接口
 */
export interface IPlugin {
  /**
   * 唯一的插件标识符
   */
  readonly name: string;

  /**
   * 插件安装函数
   * 当插件注册到追踪器时调用
   *
   * @param context - 插件执行上下文
   */
  install(context: PluginContext): void;

  /**
   * 插件卸载函数（可选）
   * 用于清理监听器等
   */
  uninstall?(): void;
}
