import DefinePlugin, { PluginContext } from './definePlugin';
import { EMIT_TYPE } from '../types/event';
import { TYPES } from '../types/event';

export interface BehaviorOptions {
  /** 过滤函数，返回 false 则不记录该点击事件 */
  filter?: (element: HTMLElement) => boolean;
}

export class BehaviorPlugin extends DefinePlugin {
  private options: BehaviorOptions;

  constructor(options: BehaviorOptions = {}) {
    super(TYPES.CLICK);
    this.options = options;
  }

  install(context: PluginContext): void {
    this.context = context;
    this.setupClickListeners();
  }

  private setupClickListeners() {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // 如果配置了过滤函数且返回 false，则不记录
      if (this.options.filter && !this.options.filter(target)) {
        return;
      }

      // 收集点击元素信息
      const clickData = {
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        text: target.textContent?.trim(),
        xPath: this.getElementXPath(target),
      };

      this.context?.emit(EMIT_TYPE.BEHAVIOR_CLICK, clickData);
    };

    const listener = (e: Event) => {
      setTimeout(() => handleClick(e), 300);
    };

    document.addEventListener(EMIT_TYPE.BEHAVIOR_CLICK, listener, true);
  }

  // 获取元素的 XPath
  private getElementXPath(element: HTMLElement): string {
    if (!element || element.nodeType !== 1) return '';
    if (element.id) return `//*[@id="${element.id}"]`;

    const sameTagSiblings = Array.from(element.parentNode?.children || []).filter(
      (el) => el.tagName === element.tagName,
    );

    const idx = sameTagSiblings.indexOf(element) + 1;
    return `${this.getElementXPath(element.parentNode as HTMLElement)}/${element.tagName.toLowerCase()}[${idx}]`;
  }
}
