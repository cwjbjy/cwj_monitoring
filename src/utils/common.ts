/**
 * 节流函数
 * @param fn 执行函数
 * @param delay 延迟时间（ms）
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let lastTime = 0;
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

export const isIgnoredScriptSource = (sourceURL?: string) => {
  if (!sourceURL || typeof sourceURL !== 'string') return false;
  if (/node_modules/.test(sourceURL)) return true;
  return false;
};
