import EventTrack from './eventTrack';
import Reporter from './reporter';
import type { Options } from '../types/index';
import type { IPlugin } from '../plugin/definePlugin';

export default class Core extends EventTrack {
  private pluginMap: Map<string, IPlugin> = new Map();
  private options: Options;

  constructor(options: Options) {
    const reporter = new Reporter(options.url, options.transport);
    super(options, reporter);
    this.options = options;
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
      url: this.options.url,
    };

    this.pluginMap.forEach((plugin) => {
      plugin.install(context);
    });

    // 挂载全局变量
    this.mount();
  }

  // 停止并卸载所有插件
  stop() {
    this.pluginMap.forEach((plugin) => {
      plugin.uninstall?.();
    });
    this.pluginMap.clear();

    // 卸载全局变量
    this.unmount();
  }

  private mount() {
    const { globalKey = '$track' } = this.options;
    if (typeof window !== 'undefined') {
      (window as any)[globalKey] = this;
    }
  }

  private unmount() {
    const { globalKey = '$track' } = this.options;
    if (typeof window !== 'undefined' && (window as any)[globalKey] === this) {
      delete (window as any)[globalKey];
    }
  }
}

/**
 * 创建监控实例的工厂函数
 * @param options 配置项
 */
export function createMonitor(options: Options): Core {
  return new Core(options);
}
