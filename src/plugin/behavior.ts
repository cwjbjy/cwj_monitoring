import { IPlugin, PluginContext } from './definePlugin';
import { EMIT_TYPE, TYPES } from '../types/event';
import { throttle } from '../utils';

export interface BehaviorOptions {
  /** 过滤函数，返回 false 则不记录该点击事件 */
  filter?: (element: HTMLElement) => boolean;
  /** 节流延迟时间（ms），默认 500ms */
  throttleDelay?: number;
}

export const BehaviorPlugin = (options: BehaviorOptions = {}): IPlugin => {
  const { throttleDelay = 500 } = options;
  let context: PluginContext;

  // 获取元素的 XPath
  const getElementXPath = (element: HTMLElement): string => {
    if (!element || element.nodeType !== 1) return '';
    if (element.id) return `//*[@id="${element.id}"]`;

    const sameTagSiblings = Array.from(element.parentNode?.children || []).filter(
      (el) => el.tagName === element.tagName,
    );

    const idx = sameTagSiblings.indexOf(element) + 1;
    return `${getElementXPath(element.parentNode as HTMLElement)}/${element.tagName.toLowerCase()}[${idx}]`;
  };

  const handleClick = throttle((e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    // 如果配置了过滤函数且返回 false，则不记录
    if (options.filter && !options.filter(target)) {
      return;
    }

    // 收集点击元素信息
    const clickData = {
      tagName: target.tagName,
      id: target.id,
      className: target.className,
      text: target.textContent?.trim(),
      xPath: getElementXPath(target),
    };

    context?.emit(EMIT_TYPE.CLICK, clickData);
  }, throttleDelay);

  return {
    name: TYPES.CLICK,
    install: (ctx: PluginContext) => {
      context = ctx;
      document.addEventListener(EMIT_TYPE.CLICK, handleClick, true);
    },
    uninstall: () => {
      document.removeEventListener(EMIT_TYPE.CLICK, handleClick, true);
    },
  };
};
