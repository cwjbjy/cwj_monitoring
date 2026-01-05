import Core from '.';
import { Validator } from '../utils';
import type { Options } from '../types/index';
export default class Tracker {
  private static instance: Core;

  public static start(options: Options) {
    if (!Validator.validate(options)) return;

    this.instance = new Core(options);

    // 支持自定义全局变量名称，默认为 $track
    const globalKey = options.globalKey || '$track';
    (window as any)[globalKey] = this.instance;

    this.loadPlugins(options);
  }

  // 根据参数启动对应的监听功能
  private static loadPlugins(options: Options) {
    const { plugin: plugins = [] } = options;

    // 直接加载传入的插件实例
    plugins.forEach((plugin) => {
      this.instance.use(plugin);
    });

    this.instance.run();
  }
}
