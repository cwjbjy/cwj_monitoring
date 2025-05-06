import Core from '../core';

export interface IPlugin {
  /** 插件名字 */
  name: string;
  /** 插件初始化 */
  monitor: (track: Core) => void;
}

/* 模板方法模式 */
export default abstract class DefinePlugin implements IPlugin {
  public name: string;
  protected track?: Core;

  constructor(name: string) {
    this.name = name;
  }
  /**监听逻辑收集数据 */
  abstract monitor(track: Core): void;
}
