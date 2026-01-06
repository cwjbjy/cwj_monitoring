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
   * 应与配置中的插件类型匹配
   */
  readonly name: string;

  /**
   * 插件安装函数
   * 当插件注册到追踪器时调用
   *
   * @param context - 插件执行上下文
   */
  install(context: PluginContext): void;
}

/**
 * 创建插件的抽象基类
 * 提供通用功能并强制执行插件契约
 */
export default abstract class DefinePlugin implements IPlugin {
  /**
   * 插件标识符
   */
  public readonly name: string;

  /**
   * 插件上下文引用
   * 安装后可用
   */
  protected context?: PluginContext;

  /**
   * 创建新的插件实例
   *
   * @param name - 唯一的插件标识符
   */
  constructor(name: string) {
    this.name = name;
  }

  /**
   * 插件安装逻辑
   * 必须由子类实现
   *
   * @param context - 插件执行上下文
   */
  abstract install(context: PluginContext): void;
}
