/**
 * 异步执行 / 空闲时刻 /每帧回调
 */
export const nextTime =
  window.requestIdleCallback || window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 1000 / 60));

export const beforeUnload = (callback: () => void) => {
  window.addEventListener('beforeunload', () => {
    callback();
  });
};
