import EventTrack from './eventTrack';
import type { Options } from '../types/index';
import type { IPlugin } from '../plugin/definePlugin';

export default class Core extends EventTrack {
  private pluginMap: Map<string, IPlugin> = new Map();
  constructor(options: Options) {
    super(options);
  }

  use(plugin: IPlugin): Core {
    if (!this.pluginMap.has(plugin.name)) {
      this.pluginMap.set(plugin.name, plugin);
    }
    return this; // 方便链式调用
  }

  // 启动插件
  run() {
    const context = {
      emit: this.emit.bind(this),
      url: this.url,
    };

    this.pluginMap.forEach((plugin) => {
      plugin.install(context);
    });
  }
}
