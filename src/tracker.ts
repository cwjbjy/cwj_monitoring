import Core from './core';
import { Validator } from './utils';
import type { Options } from './types/index';
import type { IPlugin } from './plugin/definePlugin';
export default class Tracker {
  private static instance: Core;
  private static plugins: Map<string, any> = new Map();

  public static registerPlugin(plugin: IPlugin) {
    this.plugins.set(plugin.name, plugin);
  }

  public static start(options: Options) {
    if (!Validator.validate(options)) return;

    this.instance = new Core(options);
    window.$track = this.instance;

    this.loadPlugins(options);
  }

  //根据参数启动对应的监听功能
  private static loadPlugins(options: Options) {
    const { plugin: pluginNames = [] } = options;
    // 加载指定插件或全部插件
    const pluginsToLoad = pluginNames.length > 0 ? pluginNames : Array.from(this.plugins.keys());

    pluginsToLoad.forEach((pluginName) => {
      const plugin = this.plugins.get(pluginName);
      if (plugin) {
        this.instance.use(plugin);
      }
    });

    this.instance.run();
  }
}
