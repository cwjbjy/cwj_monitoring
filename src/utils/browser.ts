import Bowser from 'bowser';

/**
 * 获取浏览器名称和版本等设备信息
 */
export function getBrowserNameVersion() {
  const { browser, os, platform } = Bowser.parse(window.navigator.userAgent);
  return {
    browser,
    os,
    platform,
    ratio: getRatio(),
    wh: getWH(),
  };
}

/**
 * 获取屏幕缩放比例
 */
function getRatio() {
  let ratio = 0;
  const screen: any = window.screen;
  const ua = navigator.userAgent.toLowerCase();
  if (window.devicePixelRatio !== undefined) {
    ratio = window.devicePixelRatio;
  } else if (~ua.indexOf('msie')) {
    if (screen.deviceXDPI && screen.logicalXDPI) {
      ratio = screen.deviceXDPI / screen.logicalXDPI;
    }
  } else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
    ratio = window.outerWidth / window.innerWidth;
  }

  if (ratio) {
    ratio = Math.round(ratio * 100);
  }
  return ratio;
}

/**
 * 获取浏览器屏幕宽高
 */
function getWH() {
  return {
    width: window.screen.width,
    height: window.screen.height,
  };
}

/**
 * 异步执行 / 空闲时刻 / 每帧回调
 */
export const nextTime =
  window.requestIdleCallback || window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 1000 / 60));

/**
 * 页面卸载前的回调
 */
export const beforeUnload = (callback: () => void) => {
  window.addEventListener('beforeunload', () => {
    callback();
  });
};
