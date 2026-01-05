import type Core from '../core';

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
   * @param tracker - 核心追踪器实例
   */
  install(tracker: Core): void;
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
   * 追踪器实例的引用
   * 安装后可用
   */
  protected tracker?: Core;

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
   * @param tracker - 核心追踪器实例
   */
  abstract install(tracker: Core): void;
}
