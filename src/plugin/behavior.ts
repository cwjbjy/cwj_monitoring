import DefinePlugin from './definePlugin';
import Core from '../core';
import { EMIT_TYPE } from '../types/event';
import { TYPES } from '../types/event';

class BehaviorPlugin extends DefinePlugin {
  constructor() {
    super(TYPES.CLICK);
  }

  install(track: Core): void {
    this.track = track;
    this.setupClickListeners();
  }

  private setupClickListeners() {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // 收集点击元素信息
      const clickData = {
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        text: target.textContent?.trim(),
        xPath: this.getElementXPath(target),
      };

      this.track?.emit(EMIT_TYPE.BEHAVIOR_CLICK, clickData);
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

export default new BehaviorPlugin();
